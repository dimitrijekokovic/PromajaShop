import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";
import Image from "next/image";


export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
  stock: existingStock,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [price, setPrice] = useState(existingPrice || "");
  const [stock, setStock] = useState(existingStock || 0);
  const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState(existingImages || []);
  const [category, setCategory] = useState(assignedCategory || "");
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  useEffect(() => {
    if (assignedCategory) {
      setCategory(assignedCategory._id || ""); // Ovo osigurava da koristi _id kategorije
    }
  }, [assignedCategory]);
  
  

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title,
      description,
      price,
      stock,
      images,
      category,
      properties: productProperties,
    };

    if (_id) {
      await axios.put(`/api/products`, { ...data, _id });
    } else {
      await axios.post("/api/products", data);
    }

    setGoToProducts(true);
  }

  if (goToProducts) {
    router.push("/products");
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
  
      // Dodavanje fajlova u FormData objekat
      for (const file of files) {
        data.append("file", file);
      }
  
      try {
        // Slanje slika na backend
        const res = await axios.post("/api/upload", data);
  
        // Debug - Provera odgovora API-ja
        console.log("Uploaded image links:", res.data.links);
  
        if (res.data?.links?.length > 0) {
          // Ažuriranje state-a sa novim slikama
          setImages((prevImages) => [...prevImages, ...res.data.links]);
  
          // Debug - Provera state-a nakon dodavanja slika
          console.log("Updated images state:", [...prevImages, ...res.data.links]);
        }
      } catch (error) {
        console.error("Error uploading images:", error);
      }
  
      setIsUploading(false);
    }
  }
  

  function updateImagesOrder(images) {
    console.log("Novi raspored slika:", newImages);
  setImages([...images]); // Pravilno ažuriranje state-a
  }

  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    if (catInfo?.properties) {
      propertiesToFill.push(...catInfo.properties);
    }
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id);
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Ime proizvoda</label>
      <input
        type="text"
        placeholder="Unesite naziv proizvoda"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />

      <label>Kategorija</label>
      <select value={category || ""} onChange={(ev) => setCategory(ev.target.value)}>
        <option value="">Bez kategorije</option>
        {categories.length > 0 &&
          categories.map((c) => (
            <option key={c._id} value={c._id}>
  {c.name} {c.parent ? `(Potkategorija: ${c.parent.name})` : ""}
</option>

          ))}
      </select>

      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div key={p.name}>
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <select
              value={productProperties[p.name] || ""}
              onChange={(ev) => setProductProp(p.name, ev.target.value)}
            >
              {p.values.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        ))}

      <label>Slike</label>
      <div className="mb-2 flex flex-wrap gap-1">
      <ReactSortable
  className="flex flex-wrap gap-1"
  list={images}
  setList={updateImagesOrder}
>
  {!!images?.length &&
    images.map((link) => (
      <div
        key={link}
        className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-300"
      >
        <Image src={link} alt="Slika proizvoda" width={96} height={96} className="rounded-lg" />
      </div>
    ))}
</ReactSortable>

        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner /> Otpremanje...
          </div>
        )}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-gray-800 rounded-sm bg-gray-200 shadow-sm border-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>

          <div>Otpremi</div>

          <input type="file" onChange={uploadImages} className="hidden"></input>
        </label>
      </div>

      <label>Opis</label>
      <textarea
        placeholder="Unesite opis proizvoda"
        value={description}
        onChange={(ev) => setDescription(ev.target.value)}
      />

      <label>Količina (na stanju)</label>
      <input
        type="number"
        placeholder="Unesite količinu"
        value={stock}
        onChange={(ev) => setStock(ev.target.value)}
      />

      <label>Cena (u RSD)</label>
      <input
        type="number"
        placeholder="Unesite cenu"
        value={price}
        onChange={(ev) => setPrice(ev.target.value)}
      />

      <button type="submit" className="btn-primary">
        Sačuvaj
      </button>
    </form>
  );
}
