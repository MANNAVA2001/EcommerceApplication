import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import GiftCardPurchase from '../components/giftCards/GiftCardPurchase';

const GiftCardsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Gift Cards - E-Commerce</title>
        <meta name="description" content="Purchase gift cards" />
      </Head>
      <GiftCardPurchase />
    </>
  );
};

export default GiftCardsPage;
