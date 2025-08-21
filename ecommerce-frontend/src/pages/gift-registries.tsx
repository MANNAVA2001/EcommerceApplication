import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import GiftRegistryManagement from '../components/giftRegistry/GiftRegistryManagement';

const GiftRegistriesPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Gift Registries - E-Commerce</title>
        <meta name="description" content="Manage your gift registries" />
      </Head>
      <GiftRegistryManagement />
    </>
  );
};

export default GiftRegistriesPage;
