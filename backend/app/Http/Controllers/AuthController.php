<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    protected function formatResponse($isSuccess, $message, $result = [], $systemCode = '', $status = 200)
    {
        return response()->json([
            'is_success' => $isSuccess,
            'message' => $message,
            'result' => $result,
            'system_code' => $systemCode
        ], $status);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            return $this->formatResponse(false, 'This account is inactive.', [], 'AUTH_INACTIVE', 403);
        }

        $token = $user->createToken('admin-panel')->plainTextToken;

        return $this->formatResponse(true, 'Login successful', [
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function adminLogin(Request $request)
    {
        return $this->login($request);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->formatResponse(true, 'Logout successful');
    }
}
