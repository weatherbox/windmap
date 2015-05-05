import java.io.*;
import java.util.*;

import java.net.URLConnection;
import java.net.URL;
import java.net.MalformedURLException;

import ucar.grib.grib2.*;
import ucar.unidata.io.RandomAccessFile;

import com.mongodb.*;

public class grib2mongo {
	private static File download(String input_url, String output_file){
		File file = null;
		try {
			URL url = new URL(input_url);
			URLConnection conn = url.openConnection();
			InputStream in = conn.getInputStream();

			file = new File(output_file);
			FileOutputStream out = new FileOutputStream(file, false);

			byte[] bytes = new byte[512];
			while(true){
				int ret = in.read(bytes);
				if(ret <= 0) break;
				out.write(bytes, 0, ret);
			}

			out.close();
			in.close();

		} catch (MalformedURLException e){
		   System.out.println("malformed");
		} catch (FileNotFoundException e){
		 	System.out.println("file not found");
		} catch (IOException e){
			System.out.println("io exception");
		}
		return file;
	}


	private static void setDB(File file, int paramCategory, int paramNumber, int surfaceType, double surfaceValue, DBCollection coll) throws IOException {
		RandomAccessFile raf = new RandomAccessFile(file.getPath(), "r");
		raf.order(RandomAccessFile.BIG_ENDIAN);
		Grib2Input input = new Grib2Input(raf);
		if (input.scan(false, false)){
			List<Grib2Record> records = input.getRecords();
			for (Grib2Record record : records){
				if (isSelected(record, paramCategory, paramNumber, surfaceType, surfaceValue)){
					writeData(new Grib2Data(raf), record, coll);
				}
			}
		}
		raf.close();
	}


	private static boolean isSelected(Grib2Record record, int paramCategory, int paramNumber, int surfaceType, double surfaceValue) {
		Grib2Pds pds = record.getPDS().getPdsVars();
		return
			(paramCategory == pds.getParameterCategory()) &&
			(paramNumber == pds.getParameterNumber()) &&
			(surfaceType == pds.getLevelType1()) &&
			(surfaceValue == 0 || surfaceValue == pds.getLevelValue1());
	}


	private static void writeData(Grib2Data gd, Grib2Record record, DBCollection coll) throws MongoException, IOException{
		// get data
		Grib2IdentificationSection ids = record.getId();
		Grib2Pds pds = record.getPDS().getPdsVars();
        Grib2GDSVariables gds = record.getGDS().getGdsVars();
		int nx = gds.getNx();
		int ny = gds.getNy();
		int forecastTime = pds.getForecastTime();
		float[] data = gd.getData(record.getGdsOffset(), record.getPdsOffset(), ids.getRefTime());

		try { 
			// insert header
			BasicDBObject header = new BasicDBObject("t", -1)
				.append("nx", nx)
				.append("ny", ny)
				.append("lo1", gds.getLo1())
				.append("la1", gds.getLa1())
				.append("dx", gds.getDx())
				.append("dy", gds.getDy());
			coll.insert(header);

			// insert data row
			for (int i = 0; i < ny; i++){
				BasicDBObject doc = new BasicDBObject("t", forecastTime)
					.append("r", i)
					.append("d", Arrays.copyOfRange(data, i*nx, (i+1)*nx-1));
				coll.insert(doc);
			}

		} catch (Exception e) {
			System.out.println("There was an error: " + e.getMessage());
		}
		System.out.print(".");
	}




	public static void main(String[] args) {
		try {
			File file = download(
				"http://database.rish.kyoto-u.ac.jp/arch/jmadata/data/gpv/original/2015/02/14/Z__C_RJTD_20150214000000_MSM_GPV_Rjp_Lsurf_FH00-15_grib2.bin",
				"grib.grib"
			);

			// connect to mongodb
			MongoClient mongoClient = new MongoClient(new MongoClientURI(System.getenv("MONGOLAB_URI")));
			DB db = mongoClient.getDB("heroku_app33876585");

			DBCollection coll_u = db.getCollection("surface_wind_u");
			setDB(file, 2, 2, 103, 10, coll_u);
			coll_u.ensureIndex("r");
			coll_u.ensureIndex("t");
			
			DBCollection coll_v = db.getCollection("surface_wind_v");
			setDB(file, 2, 3, 103, 10, coll_v);
			coll_v.ensureIndex("r");
			coll_v.ensureIndex("t");

			// close
			mongoClient.close();

		} catch (IOException e){
			System.out.println("io exception");

		} catch (Exception e) {
			System.out.println("There was an error: " + e.getMessage());
		}
	}
}
