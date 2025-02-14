import React from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function OrderDetailsModal({ order, onClose, onDelete }) {
    if (!order) return null;

    async function handleDelete() {
        const result = await Swal.fire({
            title: 'Da li ste sigurni?',
            text: `Želite da izbrišete narudžbinu "${order.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Da, izbriši!',
            cancelButtonText: 'Otkaži'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/orders?id=${order._id}`);
                if (onDelete) {
                    onDelete(order._id);
                }
                onClose();
                Swal.fire(
                    'Obrisano!',
                    'Narudžbina je uspešno izbrisana.',
                    'success'
                );
            } catch (err) {
                console.error("Greška prilikom brisanja narudžbine:", err);
                Swal.fire(
                    'Greška!',
                    'Došlo je do greške prilikom brisanja narudžbine.',
                    'error'
                );
            }
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Detalji narudžbine</h2>
                <p><strong>Ime i prezime:</strong> {order.name}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Grad:</strong> {order.city}</p>
                <p><strong>Adresa:</strong> {order.streetAddress}</p>
                <p><strong>Postanski broj:</strong> {order.postalCode}</p>
                <p><strong>Broj telefona:</strong> {order.phoneNumber}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Datum:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Ukupan iznos:</strong> {order.total} RSD</p>
                <h3>Proizvodi:</h3>
                <ul>
                    {order.products.map((product, index) => (
                        <li key={index}>
                            {product.name} x{product.quantity}
                        </li>
                    ))}
                </ul>
                <div className="flex gap-2 mt-4">
                    <button className="btn-default" onClick={onClose}>Zatvori</button>
                    <button className="btn-red" onClick={handleDelete}>Izbriši</button>
                </div>
            </div>
        </div>
    );
}
