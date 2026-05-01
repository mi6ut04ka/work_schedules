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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('personnel_number')->unique();
            $table->string('name');
            $table->foreignId('organisation_unit_id')->constrained('organisation_units');
            $table->integer('vacation_days_balance')->default(28);
            $table->enum('work_type', ['5/2', 'shift']);
            $table->integer('shift_work')->default(0); // Дней работы для вахтовиков
            $table->integer('shift_start')->default(0); // Дней отпуска для вахтавиков
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
