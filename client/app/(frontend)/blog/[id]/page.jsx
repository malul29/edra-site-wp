"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApi } from "../../../../hooks/useApi";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import { normalizeMediaUrl, resolveMediaUrl } from "@/lib/mediaUrl";

// Render Payload CMS Lexical rich text JSON
function renderLexicalContent(node, key) {
    if (!node) return null;

    // Handle text nodes
    if (node.type === 'text') {
        let text = node.text;
        if (!text) return null;

        // Apply formatting
        if (node.format & 1) text = <strong key={key}>{text}</strong>;
        if (node.format & 2) text = <em key={key}>{text}</em>;
        if (node.format & 4) text = <s key={key}>{text}</s>;
        if (node.format & 8) text = <u key={key}>{text}</u>;
        if (node.format & 16) text = <code key={key}>{text}</code>;

        return text;
    }

    // Handle link nodes
    if (node.type === 'link' || node.type === 'autolink') {
        const url = node.fields?.url || node.url || '#';
        return (
            <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                {node.children?.map((child, i) => renderLexicalContent(child, `${key}-${i}`))}
            </a>
        );
    }

    // Render children recursively
    const children = node.children?.map((child, i) => renderLexicalContent(child, `${key || 'root'}-${i}`));

    switch (node.type) {
        case 'root':
            return <>{children}</>;
        case 'paragraph':
            return <p key={key} className="blog-detail-paragraph">{children}</p>;
        case 'heading':
            const Tag = `h${node.tag || 2}`;
            return <Tag key={key} className="blog-detail-heading">{children}</Tag>;
        case 'quote':
            return <blockquote key={key} className="blog-detail-quote">{children}</blockquote>;
        case 'list':
            if (node.listType === 'number') {
                return <ol key={key}>{children}</ol>;
            }
            return <ul key={key}>{children}</ul>;
        case 'listitem':
            return <li key={key}>{children}</li>;
        case 'upload':
            const imgUrl = resolveMediaUrl(node.value);
            if (imgUrl) {
                return (
                    <div key={key} className="blog-detail-image-single">
                        <Image src={imgUrl} alt={node.value?.alt || 'Article image'} width={1200} height={700} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 720px" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} loading="lazy" quality={75} />
                    </div>
                );
            }
            return null;
        case 'horizontalrule':
            return <hr key={key} />;
        default:
            if (children) return <div key={key}>{children}</div>;
            return null;
    }
}

export default function BlogDetailPage({ params }) {
    const { id } = use(params);
    const { data: blogs, loading } = useApi("/blogs");

    const blog = blogs?.find(b => String(b.id) === String(id));

    if (loading) {
        return (
            <div className="blog-detail-loading">
                <p>Loading article…</p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="blog-detail-not-found">
                <h2>Article not found</h2>
                <Link href="/blogs">← Back to Journal</Link>
            </div>
        );
    }

    // Related blogs (excluding current)
    const relatedBlogs = blogs?.filter(b => String(b.id) !== String(id)).slice(0, 2) || [];

    // Render content block
    const renderContentBlock = (block) => {
        switch (block.type) {
            case "paragraph":
                return (
                    <p key={block.id} className="blog-detail-paragraph">
                        {block.content}
                    </p>
                );

            case "heading":
                return (
                    <h2 key={block.id} className="blog-detail-heading">
                        {block.content}
                    </h2>
                );

            case "quote":
                return (
                    <blockquote key={block.id} className="blog-detail-quote">
                        {block.content}
                    </blockquote>
                );

            case "image":
                return (
                    <div key={block.id} className="blog-detail-image-single">
                        <Image src={normalizeMediaUrl(block.content)} alt={block.caption || "Article image"} width={1200} height={700} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 720px" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} loading="lazy" quality={75} />
                        {block.caption && (
                            <p className="blog-detail-image-caption">{block.caption}</p>
                        )}
                    </div>
                );

            case "image-grid":
                return (
                    <div key={block.id} className="blog-detail-image-grid">
                        {block.content.map((img, idx) => (
                            img && (
                                <div key={idx} className="blog-detail-image-grid-item">
                                    <Image src={normalizeMediaUrl(img)} alt={`Grid image ${idx + 1}`} width={700} height={500} sizes="(max-width: 768px) 100vw, 50vw" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} loading="lazy" quality={75} />
                                </div>
                            )
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Header />
            {/* Hero Section */}
            <section className="blog-detail-hero">
                <div className="blog-detail-hero-container">
                    <div className="blog-detail-breadcrumb">
                        <Link href="/blogs">JOURNAL</Link>
                        <span className="breadcrumb-separator">•</span>
                        <span>{blog.tag.toUpperCase()}</span>
                    </div>
                    <h1 className="blog-detail-hero-title">{blog.title}</h1>
                    <p className="blog-detail-hero-subtitle">
                        {blog.subtitle || "How a challenging topography inspired a sculptural approach to natural illumination, transforming the harsh desert sun into a gentle interior glow."}
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <article className="blog-detail-article">
                <div className="blog-detail-container">
                    {/* Sidebar */}
                    <aside className="blog-detail-sidebar">
                        {/* Share Section */}
                        <div className="blog-detail-sidebar-section">
                            <h3 className="blog-detail-sidebar-title">SHARE</h3>
                            <div className="blog-detail-share">
                                <a href="#" className="blog-detail-share-link">Facebook</a>
                                <a href="#" className="blog-detail-share-link">Twitter</a>
                                <a href="#" className="blog-detail-share-link">Pinterest</a>
                                <a href="#" className="blog-detail-share-link">Email</a>
                            </div>
                        </div>

                        {/* Published Date */}
                        <div className="blog-detail-sidebar-section">
                            <h3 className="blog-detail-sidebar-title">PUBLISHED DATE</h3>
                            <p className="blog-detail-sidebar-text">{blog.date}</p>
                        </div>

                        {/* Written By */}
                        <div className="blog-detail-sidebar-section">
                            <h3 className="blog-detail-sidebar-title">WRITTEN BY</h3>
                            <p className="blog-detail-sidebar-text">{blog.author || "Arden Zwerlin"}</p>
                        </div>

                    </aside>

                    {/* Main Content */}
                    <div className="blog-detail-content">
                        {/* Featured Image */}
                        <div className="blog-detail-featured-image">
                            <Image src={resolveMediaUrl(blog.image)} alt={blog.title} width={1200} height={600} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} priority />
                        </div>

                        {/* Body Content */}
                        <div className="blog-detail-body">
                            {typeof blog.content === 'string' ? (
                                <div className="medium-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
                            ) : blog.content && blog.content.root ? (
                                // Payload CMS Lexical rich text format
                                <div className="medium-content">
                                    {renderLexicalContent(blog.content.root)}
                                </div>
                            ) : (
                                blog.content && Array.isArray(blog.content) && blog.content.length > 0 ? (
                                    blog.content.map((block) => renderContentBlock(block))
                                ) : (
                                    // Default/fallback content if no structured content exists
                                    <>
                                        <p className="blog-detail-paragraph">
                                            The desert presents a unique paradox for architects: it offers an abundance of light, yet requires absolute protection from it. When commissioned to design a private residence in California's Coachella Valley, our primary challenge was negotiating this relationship with the sun.
                                        </p>

                                        <h2 className="blog-detail-heading">Architecture as light sculptor</h2>

                                        <p className="blog-detail-paragraph">
                                            Our client, a contemporary art collector, desired a home that felt grounded in its arid environment while functioning as a terrain gallery. We kept the interior cool—extensive glazing shaded by deep overhangs—felt landscape. We wanted to manipulate light, not just block it.
                                        </p>

                                        <h2 className="blog-detail-heading">Carving from solid forms</h2>

                                        <p className="blog-detail-paragraph">
                                            Instead of a lightweight pavilion, we conceived the house as a solid mass carved from the hillside. Heavy board-formed concrete walls with voids aggregate, the exterior walls embed a formidable defense against the midday heat. The thickness of these walls creates deep reveals for the fire, carefully positioned interior windows.
                                        </p>

                                        <div className="blog-detail-image-single">
                                            <Image src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1400&auto=format&fit=crop" alt="Interior light detail" width={1200} height={700} style={{ width: '100%', height: 'auto' }} />
                                            <p className="blog-detail-image-caption">
                                                Deep cut-outs create cross views; shadows shadows modulate the day
                                            </p>
                                        </div>

                                        <p className="blog-detail-paragraph">
                                            The true source of illumination comes from above. We introduced a series of precise skylights and light wells that slice architectural strata. By capturing the harsh direct sunlight at noon, these openings diffuse the intensity, casting soft graduated light across textured interior surfaces—simultaneously highlighting and obscuring as the angles of incidence shift throughout the day.
                                        </p>

                                        <blockquote className="blog-detail-quote">
                                            "We weren't just designing a house, we were designing the shadows. The architecture becomes a canvas for the movement of the sun."
                                        </blockquote>

                                        <p className="blog-detail-paragraph">
                                            In the main living space, a dramatic linear skylight exploits the primary gallery wall, ensuring the artwork is never exposed to direct UV rays. The floor, clad in large-format travertine, acts as a secondary reflector, bouncing soft light upward and eliminating harsh shadows on faces.
                                        </p>

                                        <div className="blog-detail-image-grid">
                                            <div className="blog-detail-image-grid-item">
                                                <Image src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=700&auto=format&fit=crop" alt="Living space" width={700} height={500} style={{ width: '100%', height: 'auto' }} />
                                            </div>
                                            <div className="blog-detail-image-grid-item">
                                                <Image src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=700&auto=format&fit=crop" alt="Bedroom detail" width={700} height={500} style={{ width: '100%', height: 'auto' }} />
                                            </div>
                                        </div>

                                        <h2 className="blog-detail-heading">A tactile experience</h2>

                                        <p className="blog-detail-paragraph">
                                            Because the light is so consistent, the textures of the materials become heightened. The rough grain of the board-formed concrete, the smooth finish of the travertine, and the warmth of the smoked oak cabinetry are all emphasized by the immersive, grazing light.
                                        </p>

                                        <p className="blog-detail-paragraph">
                                            As evening approaches, the artificial lighting program takes over seamlessly. We concealed dimmed-lit fixtures inside reveals and textured voids and low-level architectural wash lighting to maintain that same quality of mystery and gentleness experienced during the day.
                                        </p>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </article>

            {/* More from the Journal */}
            <section className="blog-detail-related">
                <div className="blog-detail-related-container">
                    <div className="blog-detail-related-header">
                        <h2 className="blog-detail-related-title">More from the Journal</h2>
                        <Link href="/blogs" className="blog-detail-related-link">VIEW ALL</Link>
                    </div>
                    <div className="blog-detail-related-grid">
                        {relatedBlogs.map((relatedBlog) => (
                            <article className="blog-detail-related-card" key={relatedBlog.id}>
                                <Link href={`/blog/${relatedBlog.id}`}>
                                    <div className="blog-detail-related-image">
                                        <Image src={resolveMediaUrl(relatedBlog.image)} alt={relatedBlog.title} width={600} height={400} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                                    </div>
                                    <div className="blog-detail-related-content">
                                        <div className="blog-detail-related-meta">
                                            <span className="blog-detail-related-category">{relatedBlog.tag}</span>
                                            <span className="blog-detail-related-date">{relatedBlog.date}</span>
                                        </div>
                                        <h3 className="blog-detail-related-card-title">{relatedBlog.title}</h3>
                                        <p className="blog-detail-related-excerpt">{relatedBlog.excerpt}</p>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}
