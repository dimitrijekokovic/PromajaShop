import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from 'react-sweetalert2';

function Categories({ swal }) {
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState('');
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    function fetchCategories() {
        axios.get('/api/categories')
            .then(result => setCategories(result.data))
            .catch(error => console.error("Greška pri učitavanju kategorija:", error));
    }

    async function saveCategory(ev) {
        ev.preventDefault();
        const data = {
            name,
            properties: properties.map(p => ({
                name: p.name,
                values: p.values.split(',')
            })),
            parentCategory: parentCategory || null
        };

        try {
            if (editedCategory) {
                data._id = editedCategory._id;
                await axios.put('/api/categories', data);
                setEditedCategory(null);
            } else {
                await axios.post('/api/categories', data);
            }
        } catch (error) {
            console.error("Greška prilikom čuvanja kategorije:", error);
        }

        setName('');
        setParentCategory('');
        setProperties([]);
        fetchCategories();
    }

    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
        setProperties(
            category.properties.map(({ name, values }) => ({
                name,
                values: values.join(',')
            }))
        );
    }

    function deleteCategory(category) {
        swal.fire({
            title: 'Da li ste sigurni?',
            text: `Da li želite da izbrišete ${category.name}?`,
            showCancelButton: true,
            cancelButtonText: 'Otkaži',
            confirmButtonText: 'Da, izbriši!',
            reverseButtons: true,
            confirmButtonColor: '#d55',
        }).then(async result => {
            if (result.isConfirmed) {
                const { _id } = category;
                await axios.delete('/api/categories', { data: { _id } });
                fetchCategories();
            }
        });
    }

    function addProperty() {
        setProperties(prev => [...prev, { name: '', values: '' }]);
    }

    function handlePropertyNameChange(index, newName) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].name = newName;
            return properties;
        });
    }

    function handlePropertyValuesChange(index, newValues) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].values = newValues;
            return properties;
        });
    }

    function removeProperty(indexToRemove) {
        setProperties(prev => prev.filter((_, index) => index !== indexToRemove));
    }

    return (
        <Layout>
            <h1>Kategorije</h1>
            <label>{editedCategory ? `Izmeni kategoriju ${editedCategory.name}` : 'Napravi novu kategoriju'}</label>

            <form onSubmit={saveCategory}>
                <div className="flex gap-1">
                    <input
                        type="text"
                        placeholder="Ime kategorije"
                        onChange={e => setName(e.target.value)}
                        value={name}
                    />

                    <select
                        onChange={e => setParentCategory(e.target.value)}
                        value={parentCategory}
                    >
                        <option value="">Nema potkategoriju</option>
                        {categories.map(category => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="block">Osobine</label>
                    <button
                        type="button"
                        onClick={addProperty}
                        className="btn-default text-sm mb-2"
                    >
                        Dodaj novu osobinu
                    </button>

                    {properties.map((property, index) => (
                        <div key={index} className="flex gap-1 mb-2">
                            <input
                                type="text"
                                value={property.name}
                                onChange={e => handlePropertyNameChange(index, e.target.value)}
                                placeholder="Ime osobine (npr. dužina)"
                            />
                            <input
                                type="text"
                                value={property.values}
                                onChange={e => handlePropertyValuesChange(index, e.target.value)}
                                placeholder="Vrednosti, odvojene zarezima"
                            />
                            <button
                                type="button"
                                onClick={() => removeProperty(index)}
                                className="btn-red"
                            >
                                Ukloni
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-1">
                    {editedCategory && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditedCategory(null);
                                setName('');
                                setParentCategory('');
                                setProperties([]);
                            }}
                            className="btn-default"
                        >
                            Otkaži
                        </button>
                    )}

                    <button type="submit" className="btn-primary py-1">
                        Sačuvaj
                    </button>
                </div>
            </form>

            {!editedCategory && (
                <table className="basic">
                    <thead>
                        <tr>
                            <th>Ime kategorije</th>
                            <th>Glavna kategorija</th>
                            <th>Akcije</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category._id}>
                                <td>{category.name}</td>
                                <td>{category.parent?.name || '-'}</td>
                                <td className="flex gap-2">
                                    <button
                                        onClick={() => editCategory(category)}
                                        className="btn-primary"
                                    >
                                        Izmeni
                                    </button>
                                    <button
                                        onClick={() => deleteCategory(category)}
                                        className="btn-red"
                                    >
                                        Izbriši
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Layout>
    );
}

export default withSwal(({ swal }, ref) => (
    <Categories swal={swal} />
));
