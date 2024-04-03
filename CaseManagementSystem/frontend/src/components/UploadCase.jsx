import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import './global.js';

const UploadCase = ({ state }) => {
  const { account, contract } = state;

  const [caseName, setCaseName] = useState('');
  const [numFiles, setNumFiles] = useState(0);
  const [fileInputs, setFileInputs] = useState([]);
  const [fileArray, setFileArray] = useState([]);
  const [uniqueCaseID, setUniqueCaseID] = useState('');

  const handleFileInputChange = (index, event) => {
    if (index < 8) {
      const files = event.target.files;
      const file = files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const fileData = reader.result.split(',')[1];
        setFileArray(prevFileArray => {
          const updatedFileArray = [...prevFileArray];
          updatedFileArray[index] = {
            name: file.name,
            data: fileData,
          };
          return updatedFileArray;
        });
      };

      reader.readAsDataURL(file);
    } else {
      alert('You can upload a maximum of 8 files.');
    }
  };

  const handleUpload = async event => {
    event.preventDefault();

    const hash = CryptoJS.SHA256(caseName);
    const hashedCaseID = hash.toString(CryptoJS.enc.Hex);
    setUniqueCaseID(hashedCaseID);

    const filesData = {
      files: fileArray,
      uniqueCaseID: caseName + hashedCaseID,
    };


    const userPrivateKey = 'xxxxxxxxxxxxx';
    const IPFS_Key = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const options = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + IPFS_Key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: {
          filesData,
        },
        pinataMetadata: {
          name: caseName + '.json',
        },
        pinataOptions: {
          cidVersion: 1,
        },
      }),
    };

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', options);
      const data = await response.json();

      if (data && data.IpfsHash) {
        const encryptedCID = CryptoJS.AES.encrypt(data.IpfsHash, userPrivateKey).toString();
        console.log(data.IpfsHash);
        console.log(encryptedCID);

        const transaction = await contract.addCase(caseName, encryptedCID);
        const receipt = await transaction.wait();
        
        if (receipt.status === 1) {
          alert('Transaction Successful');
          // const caseData = await contract.getCaseData(caseName);
          // console.log('Case Data:', caseData);
        } else {
          alert('Transaction failed');
        }
        const logData = {
          address: account,
          caseName: caseName,
          event: 'Add case',
          timestamp: new Date().toISOString(),
          result: receipt.status === 1 ? 'success' : 'failed',
        };
        await sendLogToServer(logData);
      } else {
        console.log('Invalid CID received from IPFS');
      }
    } catch (err) {
      console.log(err);
      const logData = {
        address: account,
        caseName: caseName,
        event: 'Add case',
        timestamp: new Date().toISOString(),
        result: 'error - ' + err.message
      };
      await sendLogToServer(logData);
    }
  };

  const sendLogToServer = async (logData) => {
    try {
      console.log('Log Data:', logData);
        const response = await fetch('http://192.168.0.110:5000/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logData)
        });
        const data = await response.json();
        console.log('Log sent successfully:', data);
    } catch (error) {
        console.error('Error sending log:', error);
    }
  };

  return (
    <div className="w-full h-full p-10 justify-center items-center mx-auto bg-[#030014] max-w-7xl overflow-y-hidden overflow-x-hidden">
      <form className="max-w-sm mx-auto">
        <div className="mb-5">
          <label htmlFor="account" className="block mb-2 text-sm font-medium text-white">
              Connected Account
          </label>
           <input
             type="text"
             id="account"
             className="shadow-sm border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm-light"
             value={account}
             readOnly
           />
           </div>
           <div className="mb-5">
          <label htmlFor="caseName" className="block mb-2 text-sm font-medium text-white">
            Unique Case Name
          </label>
          <input
            type="text"
            id="caseName"
            className="shadow-sm border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm-light"
            value={caseName}
            onChange={e => setCaseName(e.target.value)}
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="numFiles" className="block mb-2 text-sm font-medium text-white">
            No of files to Upload
          </label>
          <input
            type="number"
            id="numFiles"
            className="shadow-sm border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm-light"
            value={numFiles}
            onChange={e => setNumFiles(parseInt(e.target.value))}
            required
          />
        </div>
        {Array.from({ length: numFiles }).map((_, index) => (
          <div key={index} className="mb-5">
            <label htmlFor={`file-${index}`} className="block mb-2 text-sm font-medium text-white">{`File ${
              index + 1
            }`}</label>
            <input
              type="file"
              id={`file-${index}`}
              className="hidden"
              onChange={e => handleFileInputChange(index, e)}
            />
            <label htmlFor={`file-${index}`} className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-lg">
              Choose File
            </label>
          </div>
        ))}
        <button
          type="submit"
          onClick={handleUpload}
          className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
        >
          Save on Blockchain
        </button>
      </form>
    </div>
  );
};

export default UploadCase;
