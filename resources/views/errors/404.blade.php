<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Page Not Found | {{ config('app.name', 'TechMarket BD') }}</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0b1120;
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            text-align: center;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 48px 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(12px);
        }
        .badge {
            font-size: 80px;
            font-weight: 900;
            background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #f97316 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1;
            margin-bottom: 16px;
        }
        h1 {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 12px;
            color: #ffffff;
        }
        p {
            font-size: 15px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        .btn-group {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
        }
        .btn-primary {
            background: #2563eb;
            color: #ffffff;
        }
        .btn-primary:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="badge">404</div>
        <h1>Page Not Found</h1>
        <p>The page or product you're looking for doesn't exist or has moved. Explore authentic laptops, gaming computers and tech components on TechMarket BD.</p>
        <div class="btn-group">
            <a href="/" class="btn btn-primary">Back to Homepage</a>
            <a href="/catalog" class="btn btn-secondary">Browse All Products</a>
            <a href="/pc-builder" class="btn btn-secondary">PC Builder</a>
        </div>
    </div>
</body>
</html>
