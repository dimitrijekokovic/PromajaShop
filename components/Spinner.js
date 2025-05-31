import { BounceLoader, PulseLoader } from "react-spinners";

export default function Spinner() {
    return (
        <PulseLoader color={'#808080'} speedMultiplier={2} />
    );
}