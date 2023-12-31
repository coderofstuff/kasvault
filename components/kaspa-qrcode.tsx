import { QRCode } from 'react-qrcode-logo';

export default function KaspaQrCode(props) {
    return (
        <QRCode
            value={props.value}
            fgColor='#134a40'
            eyeRadius={[
                [10, 10, 0, 10], // top/left eye
                [10, 10, 10, 0], // top/right eye
                [10, 0, 10, 10], // bottom/left
            ]}
            eyeColor={[
                { outer: '#134a40', inner: '#49EACB' },
                { outer: '#134a40', inner: '#49EACB' },
                { outer: '#134a40', inner: '#49EACB' },
            ]}
        />
    );
}
