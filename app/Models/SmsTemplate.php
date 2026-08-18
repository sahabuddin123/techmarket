<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsTemplate extends Model
{
    use HasFactory;

    protected $table = 'sms_templates';

    protected $fillable = [
        'name',
        'slug',
        'event_key',
        'category',
        'recipient_type',
        'message',
        'variables',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Render message with dynamic data dictionary.
     */
    public function render(array $data): string
    {
        $text = $this->message;

        foreach ($data as $key => $value) {
            $valStr = (is_scalar($value) || (is_object($value) && method_exists($value, '__toString')))
                ? (string)$value
                : '';
            $text = str_replace(["{{" . $key . "}}", "{{" . trim($key) . "}}"], $valStr, $text);
        }

        return $text;
    }
}
