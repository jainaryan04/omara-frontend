import { useEffect, useState } from "react";
import axios from "axios";

export default function Table() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cursor, setCursor] = useState<number | null>(null); // Start with null for cursor
    const [hasMore, setHasMore] = useState(true); // Initially, assume there is more data
    const [isFetching, setIsFetching] = useState(false); // Track fetching state
    const backendURL = import.meta.env.VITE_BACKEND_URL + "/send";

    // Function to fetch data
    const fetchData = async () => {
        if (isFetching || !hasMore) return; // Prevent multiple simultaneous fetches

        setIsFetching(true);
        setLoading(true);

        try {
            const response = await axios.get(backendURL, {
                params: { cursor },
            });

            if (response.data && Array.isArray(response.data.data)) {
                const orders = response.data.data;
                setData((prevData) => [...prevData, ...orders]); // Append new orders to existing data
                setHasMore(response.data.nextCursor !== null); // Check if more data exists
                setCursor(response.data.nextCursor); // Update cursor for next fetch
            } else {
                setError(`Data format error: ${JSON.stringify(response.data)}`);
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsFetching(false);
            setLoading(false);
        }
    };

    // Fetch data when the component mounts and when cursor changes
    useEffect(() => {
        fetchData();
    }, [cursor]); // Trigger fetch only when cursor changes

    // Handle the "Load More" button click
    const handleLoadMore = () => {
        if (!isFetching && hasMore) {
            setCursor((prevCursor) => (prevCursor === null ? 0 : prevCursor + 10)); // Update cursor
        }
    };

    const getHeaders = () => {
        if (data.length === 0) return [];
        const headers = Object.keys(data[0]);
        return headers.map((header) =>
            header === "items" ? "Items (Name, Qty, Price)" : header
        );
    };

    const renderCell = (header: string, item: any) => {
        if (header === "items") {
            if (Array.isArray(item[header])) {
                return item[header]
                    .map((product: any) => `${product.name} (Qty: ${product.quantity}, Price: $${product.price})`)
                    .join(", ");
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
                <p style={{ color: "red" }}>Error: {error}</p>
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
                            onClick={handleLoadMore} // Load more when the button is clicked
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
