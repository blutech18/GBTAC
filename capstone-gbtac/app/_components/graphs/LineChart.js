import {Line} from 'react-chartjs-2';

export default function LineChart({options, data }){
    return (
        <div className="bg-white p-5 m-5">
            <Line
                data= {data}
                options={options}
            />
        </div>
    );
}