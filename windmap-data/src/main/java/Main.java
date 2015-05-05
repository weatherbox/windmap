import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.*;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Date;
import java.util.Set;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.BasicDBObject;
import com.mongodb.MongoException;

public class Main extends HttpServlet {
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
		throws ServletException, IOException {

		if (req.getRequestURI().endsWith("/db")) {
			showDatabase(req,resp);
		} else {
			showHome(req,resp);
		}
	}

	private void showHome(HttpServletRequest req, HttpServletResponse resp)
		throws ServletException, IOException {
		resp.getWriter().print("Hello from Java!");
	}

	private void showDatabase(HttpServletRequest req, HttpServletResponse resp)
		throws ServletException, MongoException, IOException {
		try { 
			MongoClient mongoClient = new MongoClient(new MongoClientURI(System.getenv("MONGOLAB_URI")));
			DB db = mongoClient.getDB("heroku_app33876585");

			DBCollection coll = db.getCollection("test");
			BasicDBObject doc = new BasicDBObject("time", new Date());
			coll.insert(doc);

			mongoClient.close();
			resp.getWriter().print("test");
		} catch (Exception e) {
			resp.getWriter().print("There was an error: " + e.getMessage());
		}
	}


	public static void main(String[] args) throws Exception {
		Server server = new Server(Integer.valueOf(System.getenv("PORT")));
		ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
		context.setContextPath("/");
		server.setHandler(context);
		context.addServlet(new ServletHolder(new Main()),"/*");
		server.start();
		server.join();
	}
}
