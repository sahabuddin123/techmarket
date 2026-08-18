<?php

namespace App\Services\Email\Providers;

use App\Models\EmailGateway;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransportFactory;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;

class AmazonSesEmailProvider implements EmailProviderInterface
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
            $region = $config['region'] ?? 'ap-south-1';
            $host = $config['host'] ?? "email-smtp.{$region}.amazonaws.com";
            $port = (int) ($config['port'] ?? 587);
            $user = $config['username'] ?? ($config['api_key'] ?? '');
            $pass = $config['password'] ?? ($config['secret_key'] ?? '');

            $dsn = new Dsn('smtps', $host, $user, $pass, $port);
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

            $mailer->send($email);

            return [
                'success' => true,
                'message_id' => 'ses_' . uniqid(),
                'error' => null,
                'raw_response' => ['region' => $region, 'host' => $host],
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message_id' => null,
                'error' => 'Amazon SES error: ' . $e->getMessage(),
                'raw_response' => ['exception' => get_class($e)],
            ];
        }
    }

    public function testConnection(): array
    {
        try {
            $config = $this->gateway->config ?? [];
            $region = $config['region'] ?? 'ap-south-1';
            $host = $config['host'] ?? "email-smtp.{$region}.amazonaws.com";
            $port = (int) ($config['port'] ?? 587);
            $user = $config['username'] ?? ($config['api_key'] ?? '');
            $pass = $config['password'] ?? ($config['secret_key'] ?? '');

            $dsn = new Dsn('smtps', $host, $user, $pass, $port);
            $factory = new EsmtpTransportFactory();
            $transport = $factory->create($dsn);
            $transport->start();

            return ['success' => true, 'message' => "Amazon SES ({$region}) SMTP verified successfully."];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Amazon SES connection error: ' . $e->getMessage()];
        }
    }
}
