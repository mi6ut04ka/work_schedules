<?php

namespace Database\Factories;

use App\Models\Model;
use App\Models\OrganisationUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Model>
 */
class OrganisationUnitFactory extends Factory
{
    protected $model = OrganisationUnit::class;
    public function definition(): array
    {
        return [
            'parent_id' => null,
            'name' => $this->faker->unique()->company() . ' ' . $this->faker->randomElement(['Служба', 'Отдел', 'Участок', 'Департамент']),
        ];
    }

    public function child(int $parentId)
    {
        return $this->state(function (array $attributes) use ($parentId) {
            return [
                'parent_id' => $parentId,
            ];
        });
    }
}
