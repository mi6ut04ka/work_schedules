<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FunctionalGroup extends Model
{
    protected $fillable = ['name', 'min_presence_percent'];

    public function employees (): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'employee_functional_group', 'functional_group_id', 'employee_id');
    }
}
