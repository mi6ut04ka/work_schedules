<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('functional_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('min_presence_percent')->default(40);
            $table->timestamps();
        });

        Schema::create('employee_functional_group', function (Blueprint $table) {
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('functional_group_id')->constrained()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('functional_groups');
        Schema::dropIfExists('employee_functional_group');
    }
};
