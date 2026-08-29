<?php

namespace App\Traits;

trait SanitizesUtf8
{
    /**
     * Convert the model's attributes to an array, ensuring all strings are valid UTF-8.
     *
     * @return array
     */
    public function attributesToArray(): array
    {
        $attributes = parent::attributesToArray();
        return $this->sanitizeUtf8Recursive($attributes);
    }

    /**
     * Convert the model instance to an array.
     *
     * @return array
     */
    public function toArray(): array
    {
        $array = parent::toArray();
        return $this->sanitizeUtf8Recursive($array);
    }

    /**
     * Recursively sanitize strings to guarantee valid UTF-8 without malformed bytes.
     *
     * @param mixed $value
     * @return mixed
     */
    public function sanitizeUtf8Recursive(mixed $value): mixed
    {
        if (is_string($value)) {
            if (mb_check_encoding($value, 'UTF-8')) {
                return $value;
            }
            return mb_convert_encoding($value, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252, ASCII');
        }

        if (is_array($value)) {
            $sanitized = [];
            foreach ($value as $k => $v) {
                $cleanKey = is_string($k) 
                    ? (mb_check_encoding($k, 'UTF-8') ? $k : mb_convert_encoding($k, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252')) 
                    : $k;
                $sanitized[$cleanKey] = $this->sanitizeUtf8Recursive($v);
            }
            return $sanitized;
        }

        return $value;
    }

    /**
     * Set a given attribute on the model, sanitizing string encoding.
     *
     * @param string $key
     * @param mixed $value
     * @return mixed
     */
    public function setAttribute($key, $value)
    {
        if (is_string($value) && !mb_check_encoding($value, 'UTF-8')) {
            $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252, ASCII');
        }

        return parent::setAttribute($key, $value);
    }
}
