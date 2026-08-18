<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->latest()->paginate(15);
        $roles = Role::all();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function assignRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);

        // Prevent self-lockout of admin privileges
        if ($user->id === auth()->id() && $user->isAdmin()) {
            if (!in_array($role->name, ['Super Admin', 'Admin'])) {
                return back()->with('error', 'You cannot remove administrative privileges from your own logged-in account.');
            }
        }

        $user->roles()->sync([$role->id]);

        // Keep legacy role column aligned
        if (in_array($role->name, ['Super Admin', 'Admin'])) {
            $user->update(['role' => 'admin']);
        } elseif ($role->name === 'Manager') {
            $user->update(['role' => 'manager']);
        } else {
            $user->update(['role' => 'customer']);
        }

        AuditLogger::log('user.role_assigned', $user, null, ['role_id' => $role->id, 'role_name' => $role->name]);

        return back()->with('success', "User role updated to '{$role->name}'.");
    }
}
