import { useEffect, useState } from "react";
import axios from "axios";

export default function Table() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const backendURL = "http://localhost:5000/send";
    
    useEffect(() => {
        axios.get(backendURL)
            .then((response) => {
                console.log("Fetched data:", response.data);
                const sortedData = response.data.sort((a: any, b: any) => a.id - b.id);
                setData(sortedData);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Axios error:', error);
                setError(error.message.includes("Network Error")
                    ? "Failed to fetch data. Please check if the server is running and CORS policy allows access."
                    : error.message);
                setLoading(false);
            });
    }, [backendURL]);
    
    const getHeaders = () => {
        if (data.length === 0) return [];
        const headers = Object.keys(data[0]);
        return headers.map((header) => 
            header === 'items' ? 'Items (Name, Qty, Price)' : header
        );
    };

    const renderCell = (header: string, item: any) => {
        console.log(`Rendering cell - Header: ${header}, Item:`, item);
    
        if (header === 'items') {
            if (Array.isArray(item[header])) {
                console.log("Items array detected:", item[header]);
                return item[header]
                    .map((product: any) => `${product.name} (Qty: ${product.quantity}, Price: $${product.price})`)
                    .join(', ');
            } else {
                console.log("Items field is not an array or is missing");
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
            )}
        </div>
    );
}