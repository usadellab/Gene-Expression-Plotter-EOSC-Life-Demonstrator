const XLSX = require('xlsx');

(async () => {
  try {

    const workbook_data = XLSX.readFile('../assets/MOA2010-05_2_transcriptomics_microarrays_normalised.xlsx');
    
    let original_column_names = [];

    let worksheet_data = workbook_data.Sheets[workbook_data.SheetNames[0]];
    let table = new Object();
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
        table[key] = value;
      }
    }
    // console.log(table['MICRO.15041.C1']);
    // console.log(table['MICRO.15305.C1']);
    // console.log(table['cSTA24A5TH']);
    // console.log(table['BF_TUBSXXXX_0057H09_T3M.SCF']);


    const workbook_metadata = XLSX.readFile('../assets/MOA_Multiomics-Analysis_Phenodata-n-MIAPPE.xlsx');
    let worksheet_metadata = workbook_metadata.Sheets[workbook_metadata.SheetNames[0]];
    let dict = new Map();
    for(let row = 1; row < 907; ++row) {
      let key_address = {c:2, r:row};
      let key_ref = XLSX.utils.encode_cell(key_address);
      let genotype_address = {c:5, r:row};
      let genotype_ref = XLSX.utils.encode_cell(genotype_address);
      let treatment_address = {c:6, r:row};
      let treatment_ref = XLSX.utils.encode_cell(treatment_address);
      let leaf_number_address = {c:8, r:row};
      let leaf_number_ref = XLSX.utils.encode_cell(leaf_number_address);
      let leaf_position_address = {c:9, r:row};
      let leaf_position_ref = XLSX.utils.encode_cell(leaf_position_address);
      let replicate_address = {c:14, r:row};
      let replicate_ref = XLSX.utils.encode_cell(replicate_address);

      // group*sample*replicate
      // Genotype_LeafNumber_LeafPosition -> group, Treatment -> sample.
      let group = [worksheet_metadata[genotype_ref].v, 'Leaf'+worksheet_metadata[leaf_number_ref].v, worksheet_metadata[leaf_position_ref].v].join('_');
      let value = [group, worksheet_metadata[treatment_ref].v, worksheet_metadata[replicate_ref].v].join('*');
      dict.set(worksheet_metadata[key_ref].v, value);
     
    } 
    let new_column_names = ['ID_REF'].concat(original_column_names.slice(2).map(name => dict.get(name)));
    table['header'] = new_column_names;
    


  } catch (e){
    console.log(e);
  }
  
})();
