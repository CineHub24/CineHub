<!-- HOW TO USE
<Footer />
-->

<script>
    let year = new Date().getFullYear();
    let kinoName = "Dein Kino";
  
    const links = [
      { title: "Programm", href: "/programm" },
      { title: "Tickets", href: "/tickets" },
      { title: "Über uns", href: "/ueber-uns" },
      { title: "Kontakt", href: "/kontakt" }
    ];
  </script>
  
  <footer>
    <div class="footer-content">
      <div class="footer-left">
        <h2>{kinoName}</h2>
        <p>© {year} {kinoName}. Alle Rechte vorbehalten.</p>
      </div>
      <nav class="footer-nav">
        <ul>
          {#each links as link}
            <li><a href={link.href}>{link.title}</a></li>
          {/each}
        </ul>
      </nav>
      <div class="footer-social">
        <p>Folge uns:</p>
        <ul>
          <!-- Platzhalter für Social Icons -->
          <li><a href="#" aria-label="Facebook-Link">Facebook</a></li>
          <li><a href="#" aria-label="Instagram-Link">Instagram</a></li>
          <li><a href="#" aria-label="Twitter-Link">Twitter</a></li>
        </ul>
      </div>
    </div>
  </footer>
  
  <style>
    footer {
      background-color: #333;
      color: #fff;
      padding: 2rem;
    }
  
    .footer-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  
    @media (min-width: 600px) {
      .footer-content {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
      }
    }
  
    .footer-left h2 {
      margin: 0 0 0.5rem 0;
    }
  
    .footer-nav ul,
    .footer-social ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
  
    .footer-nav ul li,
    .footer-social ul li {
      margin: 0.5rem 0;
    }
  
    .footer-nav a,
    .footer-social a {
      color: #fff;
      text-decoration: none;
    }
  
    .footer-nav a:hover,
    .footer-social a:hover {
      text-decoration: underline;
    }
  
    .footer-social p {
      margin: 0 0 0.5rem 0;
    }
  </style>
  