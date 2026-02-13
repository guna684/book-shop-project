import { useEffect, useRef } from 'react'
import { initShop } from '../../three/shopScene.js'

type Props = {
    onClose: () => void
}

export default function ThreeShopModal({ onClose }: Props) {
    const mountRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (mountRef.current) {
            const cleanup = initShop(mountRef.current)
            return cleanup
        }
    }, [])

    return (
        <div style={overlay}>
            <div style={modal}>
                <button onClick={onClose} style={closeBtn}>✖</button>
                <div ref={mountRef} style={canvas}></div>
            </div>
        </div>
    )
}

const overlay: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.7)',
    zIndex: 9998
}

const modal: React.CSSProperties = {
    width: '92%',
    height: '92%',
    margin: 'auto',
    marginTop: '2%',
    background: '#000',
    borderRadius: '14px',
    position: 'relative'
}

const closeBtn: React.CSSProperties = {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 10,
    background: '#ffb703',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 10px',
    cursor: 'pointer'
}

const canvas: React.CSSProperties = {
    width: '100%',
    height: '100%'
}
