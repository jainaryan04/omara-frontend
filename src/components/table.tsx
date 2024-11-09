import { useEffect, useState } from "react";
import axios from "axios";

export default function Table() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cursor, setCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true); 
    const [isFetching, setIsFetching] = useState(false); 
    const backendURL = import.meta.env.VITE_BACKEND_URL + "/send";



    useEffect(() => {
        const fetchData = async () => {
            if (isFetching) return; 
            setIsFetching(true);
            try {
                setLoading(true);
                console.log("Fetching data...");

                const response = await axios.get(backendURL, {
                    params: {
                        cursor: cursor || 0,
                    },
                });
                console.log('Fetched Data:', response.data); 

                if (response.data && Array.isArray(response.data.data)) {
                    const orders = response.data.data || [];
                    setData((prevData) => [...prevData, ...orders]);
                    setHasMore(response.data.nextCursor !== undefined); 
                    setCursor(response.data.nextCursor || null);
                } else {
                    setError(`Data is not in the expected format. Received: ${JSON.stringify(response.data)}`);
                }
            } catch (error) {
                console.error('Axios error:', error);
                setError(error.message.includes("Network Error")
                    ? "Failed to fetch data. Please check if the server is running and CORS policy allows access."
                    : error.message);
            } finally {
                setIsFetching(false); 
                setLoading(false);
            }
        };

        fetchData();
    }, [cursor]); 

    const getHeaders = () => {
        if (data.length === 0) return [];
        const headers = Object.keys(data[0]);
        return headers.map((header) => 
            header === 'items' ? 'Items (Name, Qty, Price)' : header
        );
    };

    const renderCell = (header: string, item: any) => {
        if (header === 'items') {
            if (Array.isArray(item[header])) {
                return item[header]
                    .map((product: any) => `${product.name} (Qty: ${product.quantity}, Price: $${product.price})`)
                    .join(', ');
            } else {
                return "No items available";
            }
        }
        return item[header];
    };

    return (
        <div>
            <h2>Orders Table</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>Error: {error}</p>
            ) : data.length === 0 ? (
                <p>No data available</p>
            ) : (
                <>
                    <table>
                        <thead>
                            <tr>
                                {getHeaders().map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    {getHeaders().map((header) => (
                                        <td key={header}>{renderCell(header, item)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {hasMore && !isFetching && (
                        <button 
                            onClick={() => setCursor(cursor)} 
                            disabled={isFetching || !hasMore}
                        >
                            Load More
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
