<?php

namespace App\Services\Email\Providers;

use App\Models\EmailGateway;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransportFactory;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;

class SmtpEmailProvider implements EmailProviderInterface
{
    protected EmailGateway $gateway;

    public function setGateway(EmailGateway $gateway): self
    {
        $this->gateway = $gateway;
        return $this;
    }

    public function send(
        string $toEmail,
        ?string $toName,
        string $subject,
        string $htmlBody,
        ?string $plainText = null,
        array $headers = []
    ): array {
        try {
            $config = $this->gateway->config ?? [];
            $host = $config['host'] ?? '127.0.0.1';
            $port = (int) ($config['port'] ?? 587);
            $user = $config['username'] ?? '';
            $pass = $config['password'] ?? '';
            $encryption = strtolower($config['encryption'] ?? 'tls');

            // Build DSN
            $scheme = match ($encryption) {
                'ssl', 'smtps' => 'smtps',
                default => 'smtp',
            };

            $dsn = new Dsn($scheme, $host, $user, $pass, $port);
            $factory = new EsmtpTransportFactory();
            $transport = $factory->create($dsn);
            $mailer = new Mailer($transport);

            $fromEmail = $this->gateway->from_email ?: config('mail.from.address', 'noreply@techmarketbd.com');
            $fromName = $this->gateway->from_name ?: config('mail.from.name', 'TechMarket BD');

            $email = (new Email())
                ->from(new Address($fromEmail, $fromName))
                ->to(new Address($toEmail, $toName ?: ''))
                ->subject($subject)
                ->html($htmlBody);

            if ($this->gateway->reply_to_email) {
                $email->replyTo($this->gateway->reply_to_email);
            }

            if ($plainText) {
                $email->text($plainText);
            }

            foreach ($headers as $k => $v) {
                $email->getHeaders()->addTextHeader($k, $v);
            }

            $mailer->send($email);

            $messageId = 'smtp_' . uniqid() . '_' . time();

            return [
                'success' => true,
                'message_id' => $messageId,
                'error' => null,
                'raw_response' => ['host' => $host, 'port' => $port, 'status' => 'sent'],
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message_id' => null,
                'error' => $e->getMessage(),
                'raw_response' => ['exception' => get_class($e), 'trace' => $e->getMessage()],
            ];
        }
    }

    public function testConnection(): array
    {
        try {
            $config = $this->gateway->config ?? [];
            $host = $config['host'] ?? '127.0.0.1';
            $port = (int) ($config['port'] ?? 587);
            $user = $config['username'] ?? '';
            $pass = $config['password'] ?? '';
            $encryption = strtolower($config['encryption'] ?? 'tls');

            $scheme = match ($encryption) {
                'ssl', 'smtps' => 'smtps',
                default => 'smtp',
            };

            $dsn = new Dsn($scheme, $host, $user, $pass, $port);
            $factory = new EsmtpTransportFactory();
            $transport = $factory->create($dsn);
            $transport->start();

            return [
                'success' => true,
                'message' => "Successfully connected to SMTP server at {$host}:{$port}.",
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => "SMTP Connection failed: " . $e->getMessage(),
            ];
        }
    }
}
