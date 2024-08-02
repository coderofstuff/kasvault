import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './app/page';
import Wallet from './app/wallet/page';
import { Notifications } from '@mantine/notifications';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';

export default function App() {
    return (
        <div className='App'>
            <ColorSchemeScript />
            <MantineProvider
                defaultColorScheme='dark'
                theme={{
                    fontFamily: 'Inter',
                    fontFamilyMonospace: 'Roboto Mono,Courier New,Courier,monospace',
                    colors: {
                        brand: [
                            '#49EACB',
                            '#49EACB',
                            '#49EACB',
                            '#49EACB',
                            '#49EACB',
                            '#49EACB',
                            '#49EACB',
                            '#49EACB',
                            '#49EACB',
                            '#49EACB',
                        ],
                    },
                    primaryColor: 'brand',
                }}
                withGlobalStyles
            >
                <Notifications />
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='wallet' element={<Wallet />} />
                </Routes>
            </MantineProvider>
        </div>
    );
}
