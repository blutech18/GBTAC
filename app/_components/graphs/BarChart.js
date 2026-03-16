import {Bar} from 'react-chartjs-2';

export default function BarChart({options, data }){
    return (
        <div className="bg-white p-5 m-5 min-h-125">
            <Bar
                data= {data}
                options={options}
            />
        </div>
    );
}