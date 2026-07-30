CREATE TABLE hub_links (                                          
id TEXT PRIMARY KEY,                                              
hub_id TEXT NOT NULL,                                             
link_id TEXT NOT NULL,                                            
order_index INTEGER DEFAULT 0,                                    
FOREIGN KEY (hub_id) REFERENCES hubs(id),                         
FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,     
UNIQUE (hub_id, link_id)                                          
);                                                                
CREATE TABLE hubs (                                               
id TEXT PRIMARY KEY,                                              
user_id TEXT UNIQUE NOT NULL,                                     
title TEXT,                                                       
alias TEXT UNIQUE NOT NULL,                                       
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                   
FOREIGN KEY (user_id) REFERENCES users(id)                        
);                                                                
CREATE TABLE links (                                              
id TEXT PRIMARY KEY,                                              
user_id TEXT NOT NULL,                                            
big_link TEXT NOT NULL,                                           
title TEXT,                                                       
icon TEXT,                                                        
alias TEXT UNIQUE NOT NULL,                                       
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                   
FOREIGN KEY (user_id) REFERENCES users(id)                        
);                                                                
CREATE TABLE users (                                              
id TEXT PRIMARY KEY,                                              
first_name TEXT,                                                  
last_name TEXT,                                                   
nickname TEXT UNIQUE,                                             
img_url TEXT,                                                     
email TEXT UNIQUE NOT NULL,                                       
hashed_pass TEXT,                                                 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                   
role TEXT);
--turso db push --file ./src/sql/init.sql --db urlhubdb
