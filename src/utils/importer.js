import XLSX from 'xlsx';
// const XLSX = require('xlsx');


export async function importer(ab1, ab2) {
// ( async () =>{
  try {
    const workbook_metadata = XLSX.read(new Uint8Array(ab1), {type:'array'});
    console.log(workbook_metadata.SheetNames);
    let worksheet_metadata = workbook_metadata.Sheets[workbook_metadata.SheetNames[0]];

    const workbook_data = XLSX.read(new Uint8Array(ab2), {type:'array'});
    console.log(workbook_data.SheetNames);
    let worksheet_data = workbook_data.Sheets[workbook_data.SheetNames[0]];


    // const workbook_data = XLSX.readFile('../assets/MOA2010-05_2_transcriptomics_microarrays_normalised.xlsx');
    // let worksheet_data = workbook_data.Sheets[workbook_data.SheetNames[0]];
    
    let original_column_names = [];
    let table = new Object();
    let rows = new Object();
    for (let row = 0; row < 42035; ++row){
      let value = [];
      let key;
      for(let col = 0; col < 120; ++col) {
        let cell_address = {c:col, r:row};
        let cell_ref = XLSX.utils.encode_cell(cell_address);
        if (row===0){
          original_column_names.push(worksheet_data[cell_ref].v);
        } else if (col === 1){
          continue;
        } else if (col === 0){
          key = worksheet_data[cell_ref].v;
        } else {
          if (worksheet_data[cell_ref].v!=='null'){
            value.push(worksheet_data[cell_ref].v);
          } else {
            break;
          }
          
        }
      }
      if (value.length){
        rows[key] = value;
      }
    }
    // table.rows = rows;
    console.log(rows['MICRO.15041.C1']);
    // console.log(table['MICRO.15305.C1']);
    // console.log(table['cSTA24A5TH']);
    // console.log(table['BF_TUBSXXXX_0057H09_T3M.SCF']);


    // const workbook_metadata = XLSX.readFile('../assets/MOA_Multiomics-Analysis_Phenodata-n-MIAPPE.xlsx');
    // let worksheet_metadata = workbook_metadata.Sheets[workbook_metadata.SheetNames[0]];
    let dict = new Map();
    for(let row = 1; row < 907; ++row) {
      let key_address = {c:2, r:row};
      let key_ref = XLSX.utils.encode_cell(key_address);

      // let group_address = {c:0, r:row};
      // let group_ref = XLSX.utils.encode_cell(group_address);

      let genotype_address = {c:5, r:row};
      let genotype_ref = XLSX.utils.encode_cell(genotype_address);
      let treatment_address = {c:6, r:row};
      let treatment_ref = XLSX.utils.encode_cell(treatment_address);
      let leaf_number_address = {c:8, r:row};
      let leaf_number_ref = XLSX.utils.encode_cell(leaf_number_address);

      // let plant_number_address = {c:7, r:row};
      // let plant_number_ref = XLSX.utils.encode_cell(plant_number_address);

      let leaf_position_address = {c:9, r:row};
      let leaf_position_ref = XLSX.utils.encode_cell(leaf_position_address);

      let date_treatment = {c:12, r:row};
      let date_treatment_ref = XLSX.utils.encode_cell(date_treatment);

      let date_observation = {c:13, r:row};
      let date_observation_ref = XLSX.utils.encode_cell(date_observation);

      let replicate_address = {c:14, r:row};
      let replicate_ref = XLSX.utils.encode_cell(replicate_address);

      // console.log(worksheet_metadata[date_ref].w);

      // group: genotype_date:observation_treatment; sample:leaf_position_leaf_number; replicate->replicate
      // worksheet_metadata[group_ref].v, 
      //one replicate : group 44 (1+3), group 56 (1+2!+3), group 57 (1+2!+3) !wrong replicate number
      //group 59 (1+2+3), group 68 (1+2+3)
      //group 53: (1+2+3) inconsistent leaf number-> no new replicate1
      let date_difference = worksheet_metadata[date_observation_ref].v-worksheet_metadata[date_treatment_ref].v;
      let group = [worksheet_metadata[genotype_ref].v, worksheet_metadata[treatment_ref].v, 'Leaf'+worksheet_metadata[leaf_number_ref].v, worksheet_metadata[leaf_position_ref].v].join('_');
      // let sample = [date_difference].join('_');
      if (date_difference<10){
        date_difference = '0'+date_difference;

      }
      let value = [group, date_difference, worksheet_metadata[replicate_ref].v].join('*');
      

      dict.set(worksheet_metadata[key_ref].v, value);
     
    } 
    // let sliced_column_names = original_column_names.slice(2);
    let new_column_names = original_column_names.slice(2).map(name => dict.get(name));
    // table['header'] = new_column_names;

    
    let sorted_header = [...new_column_names].sort();
    // console.log(sorted_header);
    let sorted_rows = new Object();

    for (let row_id of Object.keys(rows)){
      // console.log(row_id);
      let sorted_row = [];
      for (let col of sorted_header){
        let index = new_column_names.indexOf(col);
        sorted_row.push(rows[row_id][index]);
        // let original_col_name = sliced_column_names[index];
        // console.log(col+';'+index+';'+rows[row_id][index]+';'+original_col_name);
      }
      sorted_rows[row_id] = sorted_row;
      // break;

    }
    // console.log(sorted_rows);
    table.rows = sorted_rows;
    table['header'] = sorted_header;

    // let dropped_columns = [];
    // // let group_sample = sorted_header.map(col => );
    // // console.log(group_sample);
    // let counts = {};
    // sorted_header.forEach( (col) =>
    // {
    //   let gs = col.slice(0, col.length-5);
    //   counts[gs] = counts[gs]? counts[gs]+1 :1;
    // }
    // );
    // // console.log(counts);
    // sorted_header.forEach( (col) =>
    // {
    //   let gs = col.slice(0, col.length-5);
    //   if (counts[gs]<3){
    //     dropped_columns.push(col);
    //   }
    // }
    // );
    // console.log(dropped_columns);

   

    console.log(sorted_header);


    return table;

  } catch (e){
    console.log(e);
  }
  
}
// )();