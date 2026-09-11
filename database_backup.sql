--
-- PostgreSQL database dump
--

\restrict lzyevjvSt2tjq8vkIYHwRQeEVknTr4NWiTTri7qvWkZxVmkLYMcJiL3xVwaCQ0N

-- Dumped from database version 17.10 (Homebrew)
-- Dumped by pg_dump version 17.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AnnouncementCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AnnouncementCategory" AS ENUM (
    'GENERAL',
    'HR',
    'IT',
    'URGENT'
);


--
-- Name: EmploymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmploymentStatus" AS ENUM (
    'ACTIVE',
    'PROBATION',
    'RESIGNED',
    'TERMINATED'
);


--
-- Name: OpenType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OpenType" AS ENUM (
    'same_tab',
    'new_tab'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'HR',
    'IT',
    'MANAGER',
    'EMPLOYEE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category public."AnnouncementCategory" DEFAULT 'GENERAL'::public."AnnouncementCategory" NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    start_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expire_at timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    target_roles public."Role"[],
    attachment_url text,
    attachments text[] DEFAULT ARRAY[]::text[],
    created_by uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id uuid NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon_url text DEFAULT ''::text NOT NULL,
    link_url text NOT NULL,
    open_type public."OpenType" DEFAULT 'new_tab'::public."OpenType" NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    allowed_roles public."Role"[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    entity_id text,
    details text,
    ip_address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    name_en text,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    parent_id uuid,
    head_id uuid
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid NOT NULL,
    employee_code text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    nickname text,
    phone text,
    extension text,
    avatar_url text,
    hire_date timestamp(3) without time zone,
    employment_status public."EmploymentStatus" DEFAULT 'ACTIVE'::public."EmploymentStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    user_id uuid,
    department_id uuid,
    position_id uuid,
    supervisor_id uuid
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    link text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.positions (
    id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    level integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public."Role" DEFAULT 'EMPLOYEE'::public."Role" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
bf02e163-ac72-4ff4-a807-7dbd7b0e7d69	922745ad83db9bc44a3c9dadbc9b87efcf8e12283dad92ac1e55273dc6537d7a	2026-09-11 16:17:14.224357+07	0_init		\N	2026-09-11 16:17:14.224357+07	0
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, content, category, is_pinned, start_at, expire_at, is_active, target_roles, attachment_url, attachments, created_by, created_at, updated_at) FROM stdin;
1d819734-3554-4ff3-bb32-8cf8a416d6c4	ยินดีต้อนรับสู่ ICI Connect!	บริษัทได้เปิดตัวระบบอินทราเน็ตใหม่ — ICI Connect เพื่อรวบรวมเครื่องมือ ประกาศ และทรัพยากรต่างๆ ของบริษัทไว้ในที่เดียว กรุณาสำรวจและส่งความคิดเห็นมาที่ฝ่าย IT ได้เลยครับ	GENERAL	t	2026-09-07 07:10:13.541	\N	t	{SUPER_ADMIN,ADMIN,HR,IT,MANAGER,EMPLOYEE}	\N	{}	07cfdee7-ebc8-40ed-a732-2de81a8fb162	2026-09-08 07:10:13.542	2026-09-08 07:10:13.542
40d5a701-ae5e-49e0-9378-713c88c27cd1	แจ้งปิดปรับปรุงระบบ — วันเสาร์ที่ 8 มี.ค.	ฝ่าย IT จะทำการปิดปรับปรุงระบบภายในทั้งหมดในวันเสาร์นี้ ตั้งแต่เวลา 22:00 - 02:00 น. กรุณาบันทึกงานก่อนเวลา 22:00 น. หากมีข้อสงสัยกรุณาติดต่อฝ่าย IT	IT	f	2026-09-07 07:10:13.541	2026-09-15 07:10:13.541	t	{SUPER_ADMIN,ADMIN,HR,IT,MANAGER,EMPLOYEE}	\N	{}	00cd7021-7e58-4bd4-b417-8b2bbc28c7f5	2026-09-08 07:10:13.542	2026-09-08 07:10:13.542
c40f9586-843c-4e2f-8115-76b9fac2834a	อัปเดตนโยบายการลาประจำปี 2569	กรุณาตรวจสอบนโยบายการลาพักร้อนและลาป่วยฉบับปรับปรุงใหม่ มีผลบังคับใช้ตั้งแต่วันที่ 1 เมษายน 2569 การเปลี่ยนแปลงสำคัญ: เพิ่มวันลากิจจาก 3 วันเป็น 5 วันต่อปี เอกสารฉบับเต็มดูได้ที่คลังเอกสาร	HR	f	2026-09-07 07:10:13.541	\N	t	{SUPER_ADMIN,ADMIN,HR,MANAGER,EMPLOYEE}	\N	{}	00cd7021-7e58-4bd4-b417-8b2bbc28c7f5	2026-09-08 07:10:13.542	2026-09-08 07:10:13.542
8670d61d-00b1-4aee-8b12-067482afa389	ด่วน: กรุณาเปลี่ยนรหัสผ่าน	จากการตรวจสอบความปลอดภัยล่าสุด พนักงานทุกท่านต้องเปลี่ยนรหัสผ่านภายในสัปดาห์นี้ สามารถแจ้งผ่านระบบแจ้งซ่อม IT หรือทำตามขั้นตอนในอีเมลที่ส่งไปแล้ว	URGENT	t	2026-09-07 07:10:13.541	2026-09-15 07:10:13.541	t	{SUPER_ADMIN,ADMIN,HR,IT,MANAGER,EMPLOYEE}	\N	{}	07cfdee7-ebc8-40ed-a732-2de81a8fb162	2026-09-08 07:10:13.542	2026-09-08 07:10:13.542
4a31024a-33ba-4ed8-ab79-3dbeee2312f8	ประชุม Town Hall ไตรมาส 1	ขอเชิญพนักงานทุกท่านร่วมประชุม Town Hall ไตรมาส 1 ในวันศุกร์หน้า เวลา 14:00 น. ที่ห้องประชุมใหญ่ (หรือผ่าน Zoom) CEO จะแจ้งข่าวสารบริษัทและผลประกอบการไตรมาส 1	GENERAL	f	2026-09-07 07:10:13.541	2026-10-08 07:10:13.541	t	{SUPER_ADMIN,ADMIN,HR,IT,MANAGER,EMPLOYEE}	\N	{}	00cd7021-7e58-4bd4-b417-8b2bbc28c7f5	2026-09-08 07:10:13.542	2026-09-08 07:10:13.542
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.applications (id, name, description, icon_url, link_url, open_type, display_order, is_active, allowed_roles, created_at, updated_at) FROM stdin;
38b3bebd-c0ef-445f-95ec-0acb3f4d18d2	อีเมล (Outlook)	ระบบอีเมลบริษัท — Microsoft Outlook Web	mail	https://outlook.office365.com	new_tab	1	t	{SUPER_ADMIN,ADMIN,HR,IT,MANAGER,EMPLOYEE}	2026-09-08 07:10:13.539	2026-09-08 07:10:13.539
6167c923-fb8a-4fd8-97bc-10d40b17496c	ระบบ HR	ลาหยุด, เช็คเวลาเข้างาน, บริการตนเอง HR	users	https://hr.icare.com	new_tab	2	t	{SUPER_ADMIN,ADMIN,HR,MANAGER,EMPLOYEE}	2026-09-08 07:10:13.539	2026-09-08 07:10:13.539
38f60ebd-8162-4be2-83fa-6c387e343c39	แจ้งซ่อม IT	แจ้งปัญหา IT และติดตามสถานะการซ่อม	headphones	https://helpdesk.icare.com	new_tab	3	t	{SUPER_ADMIN,ADMIN,IT,MANAGER,EMPLOYEE}	2026-09-08 07:10:13.539	2026-09-08 07:10:13.539
1571f449-daf5-4e7f-b9ea-a0d6f28ab774	คลังเอกสาร	เอกสาร, นโยบาย, คู่มือปฏิบัติงาน (SOP)	folder-open	https://docs.icare.com	new_tab	4	t	{SUPER_ADMIN,ADMIN,HR,IT,MANAGER,EMPLOYEE}	2026-09-08 07:10:13.539	2026-09-08 07:10:13.539
1464f986-8a89-4a0b-af93-2bd8af970767	ระบบ CRM ประกันภัย	ระบบจัดการลูกค้าสำหรับตัวแทนประกันภัย	shield	https://crm.icare.com	new_tab	5	t	{SUPER_ADMIN,ADMIN,MANAGER}	2026-09-08 07:10:13.539	2026-09-08 07:10:13.539
c9e0ef10-8083-4a43-9de2-a8d0e4cd6ccd	ศูนย์อบรม	คอร์สออนไลน์, ใบรับรอง, สื่อการเรียนรู้	book-open	https://training.icare.com	new_tab	6	t	{SUPER_ADMIN,ADMIN,HR,IT,MANAGER,EMPLOYEE}	2026-09-08 07:10:13.539	2026-09-08 07:10:13.539
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, entity, entity_id, details, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, code, name, name_en, description, is_active, created_at, updated_at, parent_id, head_id) FROM stdin;
0e03034e-4e8b-406e-9b03-14ef6ff8e6ff	CLAIM	เคลม	Claim	\N	t	2026-09-08 07:10:13.524	2026-09-08 07:10:13.535	\N	aa9d84bf-9ed2-4484-83a5-d295393aa353
e00eec44-9c56-4fd2-adff-60d79b1e3bb1	HR	บุคคล	Human Resources	\N	t	2026-09-08 07:10:13.524	2026-09-08 07:10:13.536	\N	0055c22c-f1da-48be-b62a-14f82ff2e36b
7ca8904b-fa58-455a-a873-5eb066c993f9	Legal	กฏหมาย	Legal	\N	t	2026-09-08 07:10:13.525	2026-09-08 07:10:13.536	\N	4f46f54d-0ef5-4531-94af-3f19393b7296
bf429c8d-926e-4802-b833-c089fdceb5d3	IA	ตรวจสอบภายใน	Internal Audit	\N	t	2026-09-08 07:10:13.525	2026-09-08 07:10:13.537	\N	d789f62e-1223-4100-8fbf-1c5abe8502a9
323f18a7-bc5b-424e-b0c1-a8e3e137f154	ACC/FN	บัญชี/การเงิน	Accounting & Finance	\N	t	2026-09-08 07:10:13.525	2026-09-08 07:10:13.537	\N	d33e34ae-aa14-4b85-9b23-6c0d08208d39
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, employee_code, first_name, last_name, nickname, phone, extension, avatar_url, hire_date, employment_status, created_at, updated_at, user_id, department_id, position_id, supervisor_id) FROM stdin;
4f46f54d-0ef5-4531-94af-3f19393b7296	ICI-0001	วิชัย	สุขสมบูรณ์	ชัย	081-111-1111	\N	\N	2020-01-01 00:00:00	ACTIVE	2026-09-08 07:10:13.527	2026-09-08 07:10:13.527	07cfdee7-ebc8-40ed-a732-2de81a8fb162	7ca8904b-fa58-455a-a873-5eb066c993f9	abc75118-cacd-4188-9b29-95208c36a8fb	\N
aa9d84bf-9ed2-4484-83a5-d295393aa353	ICI-0002	สมศักดิ์	รัตนพล	ศักดิ์	081-222-2222	\N	\N	2020-03-15 00:00:00	ACTIVE	2026-09-08 07:10:13.528	2026-09-08 07:10:13.528	00cd7021-7e58-4bd4-b417-8b2bbc28c7f5	0e03034e-4e8b-406e-9b03-14ef6ff8e6ff	cd90d705-9a7a-4f8a-bfac-6def06d9317f	4f46f54d-0ef5-4531-94af-3f19393b7296
0055c22c-f1da-48be-b62a-14f82ff2e36b	ICI-0003	พรทิพย์	วงศ์สวัสดิ์	ทิพย์	081-333-3333	1001	\N	2021-06-01 00:00:00	ACTIVE	2026-09-08 07:10:13.529	2026-09-08 07:10:13.529	70f6a52d-8f1a-4e3d-bd73-b99abb31f23a	e00eec44-9c56-4fd2-adff-60d79b1e3bb1	cd90d705-9a7a-4f8a-bfac-6def06d9317f	4f46f54d-0ef5-4531-94af-3f19393b7296
d789f62e-1223-4100-8fbf-1c5abe8502a9	ICI-0004	ธนกร	เทคโนโลยี	กร	081-444-4444	2001	\N	2021-08-15 00:00:00	ACTIVE	2026-09-08 07:10:13.529	2026-09-08 07:10:13.529	6b7ba37e-60a6-4177-8b3b-1e13847f3f12	bf429c8d-926e-4802-b833-c089fdceb5d3	fa22de1c-dacb-4a52-a3cc-8c219fbb0812	4f46f54d-0ef5-4531-94af-3f19393b7296
d33e34ae-aa14-4b85-9b23-6c0d08208d39	ICI-0005	ประวิทย์	ผู้จัดการ	วิทย์	081-555-5555	3001	\N	2022-01-10 00:00:00	ACTIVE	2026-09-08 07:10:13.53	2026-09-08 07:10:13.53	84afdee6-52e0-43db-baf8-6a0c834c472b	323f18a7-bc5b-424e-b0c1-a8e3e137f154	cd90d705-9a7a-4f8a-bfac-6def06d9317f	4f46f54d-0ef5-4531-94af-3f19393b7296
760f2ce0-e691-499e-bf42-a31db393fe02	ICI-0006	สมชาย	ใจดี	ชาย	081-666-6666	1002	\N	2023-03-01 00:00:00	ACTIVE	2026-09-08 07:10:13.53	2026-09-08 07:10:13.53	a3815c55-0890-4c51-b26c-f231288fa0ae	e00eec44-9c56-4fd2-adff-60d79b1e3bb1	62852a40-bb4d-422f-a077-015ac6b61b15	0055c22c-f1da-48be-b62a-14f82ff2e36b
53a88570-566d-4300-94df-a07b3967c02c	ICI-0007	สมหญิง	รักงาน	หญิง	081-777-7777	2002	\N	2023-06-15 00:00:00	PROBATION	2026-09-08 07:10:13.531	2026-09-08 07:10:13.531	97f9fbef-def7-447b-8752-f453c2e56569	0e03034e-4e8b-406e-9b03-14ef6ff8e6ff	62852a40-bb4d-422f-a077-015ac6b61b15	aa9d84bf-9ed2-4484-83a5-d295393aa353
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, message, is_read, link, created_at) FROM stdin;
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.positions (id, code, name, level, is_active, created_at, updated_at) FROM stdin;
abc75118-cacd-4188-9b29-95208c36a8fb	CEO	กรรมการผู้จัดการ	1	t	2026-09-08 07:10:13.522	2026-09-08 07:10:13.522
cd90d705-9a7a-4f8a-bfac-6def06d9317f	MGR	ผู้จัดการแผนก	2	t	2026-09-08 07:10:13.523	2026-09-08 07:10:13.523
fa22de1c-dacb-4a52-a3cc-8c219fbb0812	LEAD	หัวหน้าทีม	3	t	2026-09-08 07:10:13.523	2026-09-08 07:10:13.523
62852a40-bb4d-422f-a077-015ac6b61b15	STAFF	เจ้าหน้าที่	5	t	2026-09-08 07:10:13.524	2026-09-08 07:10:13.524
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, role, is_active, created_at, updated_at) FROM stdin;
07cfdee7-ebc8-40ed-a732-2de81a8fb162	วิชัย สุขสมบูรณ์	superadmin@icare.com	$2b$12$rgJ395w7cGU6yt57Zq2u/eezixYz2CyCoM4o1.fRJUMv79xGMZgae	SUPER_ADMIN	t	2026-09-08 07:10:13.515	2026-09-08 07:10:13.515
00cd7021-7e58-4bd4-b417-8b2bbc28c7f5	สมศักดิ์ รัตนพล	admin@icare.com	$2b$12$rgJ395w7cGU6yt57Zq2u/eezixYz2CyCoM4o1.fRJUMv79xGMZgae	ADMIN	t	2026-09-08 07:10:13.518	2026-09-08 07:10:13.518
70f6a52d-8f1a-4e3d-bd73-b99abb31f23a	พรทิพย์ วงศ์สวัสดิ์	hr@icare.com	$2b$12$rgJ395w7cGU6yt57Zq2u/eezixYz2CyCoM4o1.fRJUMv79xGMZgae	HR	t	2026-09-08 07:10:13.519	2026-09-08 07:10:13.519
6b7ba37e-60a6-4177-8b3b-1e13847f3f12	ธนกร เทคโนโลยี	it@icare.com	$2b$12$rgJ395w7cGU6yt57Zq2u/eezixYz2CyCoM4o1.fRJUMv79xGMZgae	IT	t	2026-09-08 07:10:13.52	2026-09-08 07:10:13.52
84afdee6-52e0-43db-baf8-6a0c834c472b	ประวิทย์ ผู้จัดการ	manager@icare.com	$2b$12$rgJ395w7cGU6yt57Zq2u/eezixYz2CyCoM4o1.fRJUMv79xGMZgae	MANAGER	t	2026-09-08 07:10:13.521	2026-09-08 07:10:13.521
a3815c55-0890-4c51-b26c-f231288fa0ae	สมชาย ใจดี	somchai@icare.com	$2b$12$rgJ395w7cGU6yt57Zq2u/eezixYz2CyCoM4o1.fRJUMv79xGMZgae	EMPLOYEE	t	2026-09-08 07:10:13.521	2026-09-08 07:10:13.521
97f9fbef-def7-447b-8752-f453c2e56569	อรรณพ ธรรมเที่ยงธรรม	Unnop.t@icare-insurance.com	$2b$12$rgJ395w7cGU6yt57Zq2u/eezixYz2CyCoM4o1.fRJUMv79xGMZgae	SUPER_ADMIN	t	2026-09-08 07:10:13.522	2026-09-08 07:10:13.522
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: departments_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX departments_code_key ON public.departments USING btree (code);


--
-- Name: departments_head_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX departments_head_id_key ON public.departments USING btree (head_id);


--
-- Name: employees_employee_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_employee_code_key ON public.employees USING btree (employee_code);


--
-- Name: employees_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_user_id_key ON public.employees USING btree (user_id);


--
-- Name: positions_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX positions_code_key ON public.positions USING btree (code);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: departments departments_head_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_head_id_fkey FOREIGN KEY (head_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: departments departments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict lzyevjvSt2tjq8vkIYHwRQeEVknTr4NWiTTri7qvWkZxVmkLYMcJiL3xVwaCQ0N

