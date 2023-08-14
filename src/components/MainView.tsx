'use client';

import { useState } from 'react';

export default function MainView() {
    const [file, setFile] = useState<Blob>();
    const [filename, setFilename] = useState<string>('')

    async function doRequest() {
        const response = await fetch('/api', {
            method: 'POST',
        });

        if (response.body) {
            const blobpart = await response.blob();

            const newFile = new Blob([blobpart], { type: '' });
            
            setFile(newFile);

            console.log(response);
            console.log(response.headers.get('content-disposition'));

            setFilename(`out_${Date.now()}.xlsx`);

        } else {
            alert('Something went wrong. No body.');
        }
    }

    return (
        <div>
            <button
                onClick={doRequest}
                style={{
                    padding: '3rem 5rem',
                }}
            >
                Do request
            </button>

            <br />

            {file && (
                <div>
                    <p>File ready!</p>
                    <a download={filename} href={window.URL.createObjectURL(file)}>Download file</a>
                </div>
            )}
        </div>
    );
}
