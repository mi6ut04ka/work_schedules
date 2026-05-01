<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrganisationUnit extends Model
{
    use HasFactory;

    protected $table = 'organisation_units';

    protected $guarded = [];

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function allChildren()
    {
        return $this->children()->with('allChildren');
    }

    public function childrenWithEmployees()
    {
        return $this->children()->with(['childrenWithEmployees', 'employees']);
    }


}
