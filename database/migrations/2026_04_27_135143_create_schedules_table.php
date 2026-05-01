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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained();
            $table->date('date')->index();
            $table->string('shift_type'); // 'work', 'vacation', 'day_off', 'shift_start', 'shift_end'
            $table->boolean('is_manual')->default(false); // Залочено ли вручную (не менять при регенерации)
            $table->boolean('is_draft')->default(true); // Черновик или опубликован
            $table->string('source')->default('system'); // 'system', 'excel_import', 'manual'
            $table->timestamps();

            $table->unique(['employee_id', 'date']); // Защита от дублей на один день
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
