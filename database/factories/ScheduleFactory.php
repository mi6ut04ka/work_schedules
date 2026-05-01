<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Schedule>
 */
class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    public function definition()
    {
        return [
            'employee_id' => Employee::factory(),
            'date' => $this->faker->date(),
            'shift_type' => $this->faker->randomElement(['work', 'vacation', 'day_off']),
            'is_manual' => false,
            'is_draft' => true,
            'source' => 'system',
        ];
    }
}
