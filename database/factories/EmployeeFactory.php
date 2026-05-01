<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\OrganisationUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'personnel_number' => $this->faker->unique()->numberBetween(100000, 999999),
            'name' => $this->faker->name(),
            'organisation_unit_id' => OrganisationUnit::inRandomOrder()->first()->id ?? OrganisationUnit::factory(),
            'vacation_days_balance' => $this->faker->randomElement([28, 32, 45]),
            'work_type' => $this->faker->randomElement(['5/2', 'shift']),
        ];
    }
}
