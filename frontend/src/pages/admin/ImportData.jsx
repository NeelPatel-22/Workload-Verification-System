import { Upload, Button, Table, message, Card, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function ImportData() {
  const [data, setData] = useState([]);
  const [fileData, setFileData] = useState(null); // store raw JSON for backend

  //for navigation
  const navigate = useNavigate();

  //file upload
  const handleUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheet = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

        setData(jsonData);       // for data preview
        setFileData(jsonData);   // for submitting data (used by backend)

      } catch (error) {
        message.error(error?.message || "Failed to parse");
      }
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  //submit button (backend will use this)
  const handleSubmit = () => {
    if (!fileData || fileData.length === 0) {
      message.warning('No data to submit');
      return;
    }

    //replace this part with API call
    console.log('Sending to backend:');

    message.success('data uploaded successfully');

    //navigate to dashboard after success
    navigate('admin/dashboard');
  };

  // show limited rows
  const previewData = data.slice(0, 5);

  // auto generate columns
  const columns =
    previewData.length > 0
      ? Object.keys(previewData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key: key,
        }))
      : [];

  return (
    <div style={{ padding: 20 }}>
      
      <Upload
        beforeUpload={handleUpload}
        showUploadList={false}
        accept=".xlsx,.xls"
      >
        <Button icon={<UploadOutlined />}>
          Upload Excel File
        </Button>
      </Upload>

      <Card style={{ marginTop: 20 }} title="Data Preview">
        {data.length === 0 ? (
          <p>No file uploaded yet</p>
        ) : (
          <Table
            dataSource={previewData}
            columns={columns}
            rowKey={(record, index) => index}
            pagination={false}
          />
        )}
      </Card>

      <Space style={{ marginTop: 20 }}>
        <Button
          type="primary"
          onClick={handleSubmit}
          disabled={data.length === 0}
        >
          Submit Data
        </Button>
      </Space>
    </div>
  );
}