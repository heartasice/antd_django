import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { fetchHomeData } from '../api/auth';
import { message } from 'antd';

const HomePage: React.FC = () => {
    const [homeMessage, setHomeMessage] = useState('');
    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchHomeData(token!);
                setHomeMessage(data.message);
            } catch (error) {
                message.error('Failed to fetch data');
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    return (
        <div>
            <h2>Home Page</h2>
            <p>{homeMessage}</p>
        </div>
    );
};

export default HomePage;