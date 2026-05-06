<?php

namespace App\Http\Controllers;

use App\Models\FunctionalGroup;
use Illuminate\Http\Request;

class FunctionalGroupController extends Controller
{
    public function index()
    {
        $groups = FunctionalGroup::with('employees')->get();

        return response()->json($groups);
    }
}
