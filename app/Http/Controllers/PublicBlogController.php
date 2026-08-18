<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicBlogController extends Controller
{
    /**
     * Display the tech blog index with categories, search, and featured posts.
     */
    public function index(Request $request)
    {
        $query = BlogPost::with('author')
            ->where('is_published', true);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $cat = $request->input('category');
            $query->where('category', $cat);
        }

        $featuredPosts = BlogPost::where('is_published', true)
            ->where('is_featured', true)
            ->latest()
            ->take(3)
            ->get();

        $posts = $query->latest()->paginate(9)->withQueryString();
        $categories = BlogPost::where('is_published', true)
            ->select('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('Blog/Index', [
            'posts' => $posts,
            'featuredPosts' => $featuredPosts,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Display a single blog article with table of contents and related posts.
     */
    public function show($slug)
    {
        $post = BlogPost::with('author')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $relatedPosts = BlogPost::where('is_published', true)
            ->where('id', '!=', $post->id)
            ->where('category', $post->category)
            ->latest()
            ->take(4)
            ->get();

        if ($relatedPosts->isEmpty()) {
            $relatedPosts = BlogPost::where('is_published', true)
                ->where('id', '!=', $post->id)
                ->latest()
                ->take(4)
                ->get();
        }

        $prevPost = BlogPost::where('is_published', true)
            ->where('id', '<', $post->id)
            ->orderBy('id', 'desc')
            ->first();

        $nextPost = BlogPost::where('is_published', true)
            ->where('id', '>', $post->id)
            ->orderBy('id', 'asc')
            ->first();

        return Inertia::render('Blog/Show', [
            'post' => $post,
            'relatedPosts' => $relatedPosts,
            'prevPost' => $prevPost,
            'nextPost' => $nextPost,
        ]);
    }
}
