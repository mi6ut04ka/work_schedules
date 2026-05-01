<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'personnel_number',
        'name',
        'organisation_unit_id',
        'vacation_days_balance',
        'shift_work',
        'shift_start'
    ];

    public function functionalGroups(): BelongsToMany
    {
        return $this->belongsToMany(FunctionalGroup::class, 'employee_functional_group');
    }

    public function organisationUnit(): BelongsTo
    {
        return $this->belongsTo(OrganisationUnit::class, 'organisation_unit_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}

