import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, ChevronDown } from 'lucide-react';

export default function MobileCategoryTree({ categories = [], depth = 0, onClose }) {
    const [expandedIds, setExpandedIds] = useState({});

    if (!categories || !categories.length) return null;

    const toggleExpand = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedIds(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <ul className={`space-y-0.5 ${depth > 0 ? 'ml-3 pl-2 border-l border-gray-200' : ''}`}>
            {categories.map((category) => {
                const hasChildren = category.children && category.children.length > 0;
                const isExpanded = !!expandedIds[category.id];

                return (
                    <li key={category.id} className="text-sm">
                        <div className="flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-gray-100/80 transition-colors">
                            <Link
                                href={`/category/${category.slug}`}
                                onClick={onClose}
                                className={`flex-1 font-medium ${depth === 0 ? 'text-gray-900 font-semibold' : 'text-gray-700 text-xs'} hover:text-red-600`}
                            >
                                {category.name}
                            </Link>

                            {hasChildren && (
                                <button
                                    type="button"
                                    onClick={(e) => toggleExpand(category.id, e)}
                                    className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-200 focus:outline-none"
                                    aria-label={`Toggle ${category.name} subcategories`}
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-red-600" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Recursive Sub-tree rendering for unlimited nesting */}
                        {hasChildren && isExpanded && (
                            <div className="mt-0.5 mb-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                <MobileCategoryTree
                                    categories={category.children}
                                    depth={depth + 1}
                                    onClose={onClose}
                                />
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
