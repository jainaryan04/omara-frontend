import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Table from './src/components/table';
import React from 'react';

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Table />
        </QueryClientProvider>
    );
}
