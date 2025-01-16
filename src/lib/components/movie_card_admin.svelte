<script lang="ts">
    import { ArrowRight } from 'lucide-svelte';
    import { languageAwareGoto } from '$lib/utils/languageAware.js';
    let { movie, url } = $props();

    function handleClick() {
        languageAwareGoto(`/admin/film/${movie.id}`)}
    }
 </script>
 
 <div class="movie-card">
    <div class="poster-container">
        <div class="poster-inner">
            <img src={movie.poster} alt="{movie.title} Poster" />
            <div class="poster-overlay"></div>
        </div>
    </div>
    <div class="content">
        <div class="info">
            <h3 class="title">{movie.title}</h3>
            <div class="details">
                <p class="runtime"><span class="label">Laufzeit:</span> {movie.runtime} Min.</p>
                <p class="director"><span class="label">Regie:</span> {movie.director}</p>
            </div>
            <div class="genres">
                {#each movie.genres as genre, i}
                    <span class="genre-tag">{genre}</span>
                {/each}
            </div>
        </div>
        <button class="edit-button" on:click={handleClick}>
            <div class="button-content">
                <span class="button-text">Bearbeiten</span>
                <span class="button-icon">
                    <div class="icon-circle">
                        <ArrowRight size={16} />
                    </div>
                </span>
            </div>
        </button>
    </div>
 </div>
 
 <style>
    .movie-card {
        display: flex;
        background-color: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        width: 530px;
        height: 350px;
        border: 1px solid #f0f0f0;
        transition: all 0.3s ease;
        position: relative;
    }
 
    .movie-card:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
    }
 
    .poster-container {
        flex: 0 0 200px;
        padding: 16px;
        padding-right: 0;
    }
 
    .poster-inner {
        width: 100%;
        height: 100%;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
 
    .poster-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            to right,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.02) 100%
        );
    }
 
    .poster-inner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
 
    .content {
        flex: 1;
        padding: 28px;
        display: flex;
        flex-direction: column;
        gap: 35px; /* Mehr Abstand zwischen Info und Button */
    }
 
    .info {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
 
    .title {
        font-size: 1.6rem;
        font-weight: 700;
        margin: 0;
        color: #1a1a1a;
        letter-spacing: -0.02em;
    }
 
    .details {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
 
    .details p {
        margin: 0;
        color: #555;
        font-size: 0.95rem;
    }
 
    .label {
        color: #999;
        font-size: 0.9rem;
    }
 
    .genres {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
 
    .genre-tag {
        background: #f3f4f6;
        color: #4b5563;
        padding: 5px 12px;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 500;
    }
 
    .edit-button {
        background: #1a1a1a; /* Schwarzer Hintergrund */
        color: white;
        border: none;
        padding: 12px;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        height: 64px;
        width: 100%;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
    }
 
    .edit-button:hover {
        background: #2d2d2d; /* Leicht helleres Schwarz beim Hover */
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
 
    .button-content {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        gap: 12px;
        height: 100%;
    }
 
    .button-text {
        font-weight: 600;
        font-size: 1rem;
        letter-spacing: 0.3px;
    }
 
    .icon-circle {
        background: rgba(255, 255, 255, 0.1); /* Angepasste Transparenz */
        border-radius: 50%;
        width: 38px; /* Etwas größer */
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
 
    .edit-button:hover .icon-circle {
        transform: translateX(4px);
        background: rgba(255, 255, 255, 0.15);
    }
 
    @media (max-width: 520px) {
        .movie-card {
            width: 100%;
            max-width: 400px;
        }
    }
 </style>
