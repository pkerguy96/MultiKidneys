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
        Schema::create('favorite_list_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('favorite_list_id');
            $table->unsignedBigInteger('testable_id');
            $table->string('testable_type');
            $table->timestamps();

            $table->foreign('favorite_list_id')->references('id')->on('favorite_lists')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorite_list_items');
    }
};
