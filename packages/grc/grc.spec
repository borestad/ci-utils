# Note that this is NOT a relocatable package
%define ver      1.0.8
%define rel      1
%define prefix   /usr
%define confdir  /etc

Summary:   Generic Colouriser
Name:      grc
Version:   %ver
Release:   %rel
License: GPL
Group:     Development/Tools
Source:    grc-%{PACKAGE_VERSION}.tar.gz
URL:       http://melkor.dnp.fmph.uniba.sk/~garabik/grc.html
BuildRoot: %{_tmppath}/grc-%{PACKAGE_VERSION}-root
Packager:  Valerij Klein <vklein@console-colors.de>
BuildArchitectures: noarch

%description
Generic Colouriser is yet another colouriser for beautifying your logfiles
or output of commands.

Authors:
--------
    Radovan Garabik <garabik@melkor.dnp.fmph.uniba.sk>

%prep
%setup

%install
rm -rf $RPM_BUILD_ROOT

install -d -m 755 $RPM_BUILD_ROOT%{prefix}/bin
install -m 755 grc $RPM_BUILD_ROOT%{prefix}/bin
install -m 755 grcat $RPM_BUILD_ROOT%{prefix}/bin
install -d -m 755 $RPM_BUILD_ROOT%{prefix}/share/grc
install -m 644 colorfiles/conf.* $RPM_BUILD_ROOT%{prefix}/share/grc
install -d -m 755 $RPM_BUILD_ROOT%{confdir}
install -m 644 grc.conf $RPM_BUILD_ROOT%{confdir}
install -d -m 755 $RPM_BUILD_ROOT%{_mandir}/man1
install -m 644 *.1 $RPM_BUILD_ROOT%{_mandir}/man1

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(-, root, root)

%doc CHANGES CREDITS README TODO Regexp.txt
%{prefix}/bin/*
%{prefix}/share/grc/*
%doc %{_mandir}/man1/*
%config(noreplace) /etc/grc.conf

%changelog
* Fri Sep 01 2006 Valerij Klein <vklein@console-colors.de> 1.0.7-1
- Minor changes in SPEC
