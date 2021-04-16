<svelte:options tag="project-list" />

<script lang="ts">
    let cards = [
        {
            title: "Chrysalis",
            img: "assets/images/Chrysalis.png",
            link: "https://chrysalis.docs.iota.org/",
        },
        {
            title: "Client Library",
            img: "assets/images/Libraries.png",
            link: "https://client-lib.docs.iota.org/",
        },
        {
            title: "Wallet Library",
            img: "assets/images/Wallet.png",
            link: "https://wallet-lib.docs.iota.org/",
        },
        {
            title: "HORNET",
            img: "assets/images/Hornet.png",
            link: "https://hornet.docs.iota.org/",
        },
        {
            title: "Bee",
            img: "assets/images/Bee.png",
            link: "https://bee.docs.iota.org/",
        },
        {
            title: "Stronghold",
            img: "assets/images/Stronghold.png",
            link: "https://stronghold.docs.iota.org/",
        },
    ];
</script>

<main>
    <div>
        <ul class="cards">
            {#each cards as card, i}
                <li class="cards_item">
                    <a class="card_link" href={card.link} target="_blank">
                        <div class="card">
                            <div class="card_image">
                                <img src={card.img} alt={card.title} />
                            </div>
                            <div class="card_content">
                                <h2 class="card_title">{card.title}</h2>
                            </div>
                        </div>
                    </a>
                </li>
            {/each}
        </ul>
    </div>
</main>

<style>
    /* Font */

    @font-face {
        font-family: "Metropolis-Bold";
        src: url("/fonts/Metropolis-Bold.woff") format("woff");
    }
    @font-face {
        font-family: "Metropolis-Medium";
        src: url("/fonts/Metropolis-Medium.woff") format("woff");
    }
    @font-face {
        font-family: "Metropolis-Regular";
        src: url("/fonts/Metropolis-Regular.woff") format("woff");
    }

    /* Design */
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    html {
        background-color: #ecf9ff;
    }

    body {
        color: #272727;
        font-family: "Open Sans";
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0;
        padding: 1rem;
    }

    .main {
        max-width: 1200px;
        margin: 0 auto;
    }

    img {
        height: auto;
        max-width: 100%;
        vertical-align: middle;
    }

    .cards {
        display: flex;
        flex-wrap: wrap;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .cards_item {
        display: flex;
        padding: 1rem;
    }

    @media (min-width: 40rem) {
        .cards_item {
            width: 50%;
        }
    }

    @media (min-width: 56rem) {
        .cards_item {
            width: 33.3333%;
        }
    }

    .card {
        background-color: white;
        border-radius: 0.25rem;
        box-shadow: 0 20px 40px -14px rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .card_content {
        padding: 2rem;
        background: linear-gradient(
            to bottom left,
            rgb(15, 193, 183) 40%,
            rgb(15, 193, 183) 100%
        );
    }

    .card_title {
        color: #ffffff;
        font-size: 1.7rem;
        font-weight: 800;
        letter-spacing: 1px;
        text-transform: capitalize;
        margin: 0px;
        text-decoration: none;
        text-align: center
    }

    .card_text {
        color: #ffffff;
        font-size: 0.875rem;
        line-height: 1.5;
        margin-bottom: 1.25rem;
        font-weight: 400;
    }

    .card_link:link { text-decoration: none; }


    .card_link:visited { text-decoration: none; }


    .card_link:hover { text-decoration: none; }


    .card_link:active { text-decoration: none; }
</style>
