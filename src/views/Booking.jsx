import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Booking.scss';

import BookingInfo from "../components/BookingInfo/BookingInfo";
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import Navigation from '../components/Navigation/Navigation';
import Shoes from "../components/Shoes/Shoes";
import Top from '../components/Top/Top';

function Booking() {
    const [booking, setBooking] = useState({
        when: "",
        time: '',
        lanes: 0,
        people: 0,
    });
    const [shoes, setShoes] = useState([]);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    function updateBookingDetails(event) {
        const { name, value } = event.target;
        setError(false);

        setBooking(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    function updateSize(event) {
        const { value, name } = event.target;
        setError(false);

        if (value.length === 2) {
            setShoes(prevState => (
                prevState.map(shoe =>
                    shoe.id === name ? { ...shoe, size: value } : shoe 
            )));
            
        }
    }

    function addShoe(name) {
        setError(false);
    
        setShoes([...shoes, { id: name, size: '' }]);
    }

    function removeShoe(name) {
        setError(false);

        setShoes(shoes.filter(shoe =>
            shoe.id !== name
        ));
    }

    async function sendBooking(bookingInfo) {
        const response = await fetch('https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com', {
            method: 'POST',
            headers: {
                'x-api-key': '738c6b9d-24cf-47c3-b688-f4f4c5747662'
            },
            body: JSON.stringify(bookingInfo)
        });
        const data = await response.json();

        return data;
    }

    function comparePeopleAndShoes() {
        return (parseInt(booking.people) * parseInt(booking.lanes)) === shoes.length;
    }

    async function book() {
        if (booking.when && booking.lanes 
            && booking.time && shoes.length > 0 
            && comparePeopleAndShoes()
            ) {
                const bookingInfo = {
                    when: `${booking.when}T${booking.time}`,
                    lanes: booking.lanes,
                    people: booking.people,
                    shoes: shoes.map(shoe => shoe.size)
                }
        
                const confirmation = await sendBooking(bookingInfo);
                navigate('/confirmation', { state: { confirmationDetails: confirmation }});
        } else {
            setError(true);
        }
    }

    return (
        <section className='booking'>
            <Navigation />
            <Top title="Booking" />
            <BookingInfo updateBookingDetails={ updateBookingDetails } />
            <Shoes updateSize={ updateSize } addShoe={ addShoe }
                    removeShoe={ removeShoe } shoes={ shoes } />
            <button className="button booking__button" onClick={ book }>strIIIIIike!</button>
            { error ? <ErrorMessage /> : '' }
        </section>
    )
}

export default Booking;