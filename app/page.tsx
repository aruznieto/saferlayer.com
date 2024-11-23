"use client";

import React from 'react';
import Head from 'next/head';
import HeroHeader from './components/HeroHeader';
import Footer from './components/Footer';

const HomePage: React.FC = () => {
    return (
        <>
            <Head>
                {/* Character Set */}
                <meta charSet="utf-8" />
                {/* Compatibility */}
                <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
                {/* Page Title */}
                <title>Saferlayer</title>
                {/* Meta Descriptions */}
                <meta
                    name="description"
                    content="Add watermarks to your documents for free and avoid scams"
                />
                <meta name="author" content="Saferlayer" />
                <meta
                    name="keywords"
                    content="watermark, id, document, identity, passport"
                />
                <meta name="robots" content="index,follow" />
                {/* Viewport Settings */}
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                />
                <meta name="HandheldFriendly" content="True" />
                <meta name="MobileOptimized" content="320" />
                <meta httpEquiv="cleartype" content="on" />
                {/* Theme Color */}
                <meta name="theme-color" content="#ffffff" />
                {/* Canonical Link */}
                <link rel="canonical" href="https://www.saferlayer.com/" />
                {/* Favicon and Icons */}
                <link rel="shortcut icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/icon.png" />
                <link rel="icon" href="/icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                {/* Uncomment if you have a mask-icon */}
                {/* <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" /> */}
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                />
                {/* Stylesheet */}
                {/* If you have a global stylesheet, you can import it here or in _app.tsx */}
                {/* <link rel="stylesheet" type="text/css" href="/styles/styles.css" /> */}
                {/* Google Fonts Preconnect */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                {/* Google Fonts */}
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Instrument+Serif:ital@0;1&display=swap"
                    rel="stylesheet"
                />
                {/* Open Graph Meta Tags */}
                <meta property="og:title" content="Saferlayer" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="/img/saferlayer.png" />
                <meta property="og:url" content="https://www.saferlayer.com/" />
                <meta property="og:site_name" content="Saferlayer" />
                <meta
                    property="og:description"
                    content="Add watermarks to your documents for free and avoid scams"
                />
                {/* Twitter Card Data */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Saferlayer" />
                <meta
                    name="twitter:description"
                    content="Add watermarks to your documents for free and avoid scams"
                />
                <meta name="twitter:image" content="/img/saferlayer.png" />
                {/* Google+ Schema Markup */}
                <meta itemProp="name" content="Saferlayer" />
                <meta
                    itemProp="description"
                    content="Add watermarks to your documents for free and avoid scams"
                />
                <meta itemProp="image" content="/img/saferlayer.png" />
            </Head>

            {/* Main Content */}
            <HeroHeader />
            <Footer />
        </>
    );
};

export default HomePage;