<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SupportTicketController extends Controller
{
    /**
     * Display listing of escalated support tickets.
     */
    public function index(Request $request): Response
    {
        abort_if(!auth()->check() || auth()->user()->role !== 'admin', 403);

        $query = SupportTicket::with(['customer', 'assignedAgent', 'session.messages'])
            ->latest();

        // Filter by Status
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Filter by Priority
        if ($request->filled('priority') && $request->input('priority') !== 'all') {
            $query->where('priority', $request->input('priority'));
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('inquiry_text', 'like', "%{$search}%");
            });
        }

        $tickets = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => SupportTicket::count(),
            'new' => SupportTicket::where('status', 'new')->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved' => SupportTicket::where('status', 'resolved')->count(),
            'closed' => SupportTicket::where('status', 'closed')->count(),
        ];

        $adminAgents = User::where('role', 'admin')->get(['id', 'name', 'email']);

        return Inertia::render('Admin/SupportTickets/Index', [
            'tickets' => $tickets,
            'stats' => $stats,
            'adminAgents' => $adminAgents,
            'filters' => [
                'status' => $request->input('status', 'all'),
                'priority' => $request->input('priority', 'all'),
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * Show ticket details with full chat session transcript.
     */
    public function show($id): Response
    {
        abort_if(!auth()->check() || auth()->user()->role !== 'admin', 403);

        $ticket = SupportTicket::with(['customer', 'assignedAgent', 'session.messages'])
            ->findOrFail($id);

        $adminAgents = User::where('role', 'admin')->get(['id', 'name', 'email']);

        return Inertia::render('Admin/SupportTickets/Show', [
            'ticket' => $ticket,
            'adminAgents' => $adminAgents,
        ]);
    }

    /**
     * Update ticket status, resolution notes, priority, or assigned agent.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        abort_if(!auth()->check() || auth()->user()->role !== 'admin', 403);

        $ticket = SupportTicket::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:new,in_progress,resolved,closed',
            'priority' => 'required|in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
            'resolution_notes' => 'nullable|string|max:2000',
        ]);

        $ticket->update($validated);

        return redirect()->back()->with('success', 'Support ticket updated successfully.');
    }

    /**
     * Delete a support ticket.
     */
    public function destroy($id): RedirectResponse
    {
        abort_if(!auth()->check() || auth()->user()->role !== 'admin', 403);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->delete();

        return redirect()->route('admin.support-tickets.index')->with('success', 'Support ticket deleted.');
    }
}
