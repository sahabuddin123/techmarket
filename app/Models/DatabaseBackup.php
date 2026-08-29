<?php

namespace App\Models;

use App\Traits\SanitizesUtf8;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class DatabaseBackup extends Model
{
    use HasFactory, SanitizesUtf8;

    protected $fillable = [
        'filename',
        'disk',
        'path',
        'format',
        'compression',
        'file_size_bytes',
        'type',
        'status',
        'error_message',
        'tables_count',
        'records_count',
        'duration_seconds',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'file_size_bytes' => 'integer',
        'tables_count' => 'integer',
        'records_count' => 'integer',
        'duration_seconds' => 'float',
    ];

    protected $appends = [
        'formatted_size',
        'is_available',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = (int)$this->file_size_bytes;
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        }
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }

    public function getIsAvailableAttribute(): bool
    {
        return Storage::disk($this->disk ?? 'local')->exists($this->path);
    }
}
