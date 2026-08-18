<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Services\ChatbotService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    /**
     * Send message to Chatbot and receive AI response.
     */
    public function message(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'session_token' => 'nullable|string|max:64',
        ]);

        $token = $request->input('session_token');
        $session = null;

        if ($token) {
            $session = ChatSession::where('session_token', $token)->first();
        }

        if (!$session) {
            $token = Str::random(32);
            $session = ChatSession::create([
                'session_token' => $token,
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'status' => 'active',
                'last_activity_at' => now(),
            ]);
        }

        $user = auth()->user();
        $response = ChatbotService::processMessage($session, $request->input('message'), $user);

        return response()->json([
            'success' => true,
            'session_token' => $session->session_token,
            'response' => $response,
        ]);
    }

    /**
     * Retrieve chat history for the current session.
     */
    public function history(Request $request): JsonResponse
    {
        $token = $request->query('session_token');
        if (!$token) {
            return response()->json(['messages' => []]);
        }

        $session = ChatSession::where('session_token', $token)->first();
        if (!$session) {
            return response()->json(['messages' => []]);
        }

        $messages = $session->messages()->get()->map(function ($msg) {
            return [
                'id' => $msg->id,
                'sender' => $msg->sender,
                'message' => $msg->message,
                'type' => $msg->type,
                'payload' => $msg->payload,
                'created_at' => $msg->created_at->toISOString(),
            ];
        });

        return response()->json([
            'session_token' => $session->session_token,
            'status' => $session->status,
            'messages' => $messages,
        ]);
    }

    /**
     * Escalate chat session to human support ticket.
     */
    public function escalate(Request $request): JsonResponse
    {
        $request->validate([
            'session_token' => 'required|string|max:64',
            'customer_name' => 'required|string|max:100',
            'customer_phone' => 'required|string|max:30',
            'customer_email' => 'nullable|email|max:150',
            'inquiry_text' => 'nullable|string|max:1000',
        ]);

        $session = ChatSession::where('session_token', $request->input('session_token'))->firstOrFail();
        $ticket = ChatbotService::escalateToSupportTicket($session, $request->all(), auth()->user());

        return response()->json([
            'success' => true,
            'ticket_number' => $ticket->ticket_number,
            'message' => "Your inquiry has been escalated to our human support team. Ticket #{$ticket->ticket_number}.",
        ]);
    }
}
